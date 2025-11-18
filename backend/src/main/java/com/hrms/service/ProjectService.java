package com.hrms.service;

import com.hrms.dto.project.*;
import com.hrms.entity.*;
import com.hrms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<ProjectListResponse> getAllProjects(String email, UUID clientId, Boolean activeOnly) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganization() == null) {
            throw new RuntimeException("User does not belong to an organization");
        }

        List<Project> projects;

        // Filter by client if clientId is provided
        if (clientId != null) {
            projects = projectRepository.findByClientId(clientId);
            // Additional check to ensure client belongs to user's organization
            projects = projects.stream()
                    .filter(p -> p.getOrganization().getId().equals(user.getOrganization().getId()))
                    .collect(Collectors.toList());
        } else {
            projects = projectRepository.findByOrganizationId(user.getOrganization().getId());
        }

        // Filter by active status if specified
        if (activeOnly != null && activeOnly) {
            projects = projects.stream()
                    .filter(p -> p.getDeletedAt() == null && "active".equals(p.getProjectStatus()))
                    .collect(Collectors.toList());
        } else {
            projects = projects.stream()
                    .filter(p -> p.getDeletedAt() == null)
                    .collect(Collectors.toList());
        }

        return projects.stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectById(UUID projectId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return mapToDetailResponse(project);
    }

    @Transactional
    public ProjectDetailResponse createProject(CreateProjectRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganization() == null) {
            throw new RuntimeException("User does not belong to an organization");
        }

        // Validate clientId is required
        if (request.getClientId() == null) {
            throw new RuntimeException("Client ID is required");
        }

        // Fetch and validate client
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (!client.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied: Client does not belong to your organization");
        }

        Project project = new Project();
        project.setOrganization(user.getOrganization());
        project.setClient(client);

        // Generate project code if not provided
        if (request.getProjectCode() == null || request.getProjectCode().isEmpty()) {
            project.setProjectCode(generateNextProjectCode(request.getClientId(), email));
        } else {
            // Check uniqueness
            if (projectRepository.existsByProjectCodeAndDeletedAtIsNull(request.getProjectCode())) {
                throw new RuntimeException("Project code already exists");
            }
            project.setProjectCode(request.getProjectCode());
        }

        project.setProjectName(request.getProjectName());
        project.setProjectType(request.getProjectType());
        project.setDescription(request.getDescription());

        // Timeline
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setEstimatedDurationMonths(request.getEstimatedDurationMonths());
        project.setProjectStatus("active");

        // Financial
        project.setProjectBudget(request.getProjectBudget());
        project.setBillingRateType(request.getBillingRateType());
        project.setDefaultBillingRate(request.getDefaultBillingRate());
        project.setCurrency("USD");

        // Management
        if (request.getProjectManagerId() != null) {
            Employee projectManager = employeeRepository.findById(request.getProjectManagerId())
                    .orElseThrow(() -> new RuntimeException("Project manager not found"));
            project.setProjectManager(projectManager);
        }

        // Status
        project.setIsBillable(request.getIsBillable() != null ? request.getIsBillable() : true);

        project.setCreatedAt(LocalDateTime.now());
        project.setCreatedBy(user);

        Project saved = projectRepository.save(project);
        return mapToDetailResponse(saved);
    }

    @Transactional
    public ProjectDetailResponse updateProject(UUID projectId, UpdateProjectRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        project.setProjectName(request.getProjectName());
        project.setProjectType(request.getProjectType());
        project.setDescription(request.getDescription());

        // Timeline
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setEstimatedDurationMonths(request.getEstimatedDurationMonths());
        if (request.getProjectStatus() != null) {
            project.setProjectStatus(request.getProjectStatus());
        }

        // Financial
        project.setProjectBudget(request.getProjectBudget());
        project.setBillingRateType(request.getBillingRateType());
        project.setDefaultBillingRate(request.getDefaultBillingRate());

        // Management
        if (request.getProjectManagerId() != null) {
            Employee projectManager = employeeRepository.findById(request.getProjectManagerId())
                    .orElseThrow(() -> new RuntimeException("Project manager not found"));
            project.setProjectManager(projectManager);
        }

        // Status
        if (request.getIsBillable() != null) {
            project.setIsBillable(request.getIsBillable());
        }

        project.setUpdatedAt(LocalDateTime.now());
        project.setUpdatedBy(user);

        Project updated = projectRepository.save(project);
        return mapToDetailResponse(updated);
    }

    @Transactional
    public void deleteProject(UUID projectId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        project.setDeletedAt(LocalDateTime.now());
        projectRepository.save(project);
    }

    public String generateNextProjectCode(UUID clientId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Project> projects;
        if (clientId != null) {
            projects = projectRepository.findByClientId(clientId);
        } else {
            projects = projectRepository.findByOrganizationId(user.getOrganization().getId());
        }

        int maxNumber = projects.stream()
                .map(Project::getProjectCode)
                .filter(code -> code != null && code.matches("PRJ\\d{4}"))
                .map(code -> Integer.parseInt(code.substring(3)))
                .max(Integer::compareTo)
                .orElse(0);

        return String.format("PRJ%04d", maxNumber + 1);
    }

    private ProjectListResponse mapToListResponse(Project project) {
        ProjectListResponse response = new ProjectListResponse();
        response.setId(project.getId());
        response.setProjectName(project.getProjectName());
        response.setProjectCode(project.getProjectCode());
        response.setProjectType(project.getProjectType());

        // Client info
        if (project.getClient() != null) {
            response.setClientId(project.getClient().getId());
            response.setClientName(project.getClient().getName());
        }

        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setProjectStatus(project.getProjectStatus());
        response.setProjectBudget(project.getProjectBudget());
        response.setCurrency(project.getCurrency());
        response.setTotalAllocatedResources(project.getTotalAllocatedResources());

        // Project Manager info
        if (project.getProjectManager() != null) {
            response.setProjectManagerId(project.getProjectManager().getId());
            String pmName = (project.getProjectManager().getFirstName() != null ? project.getProjectManager().getFirstName() : "") +
                    " " + (project.getProjectManager().getLastName() != null ? project.getProjectManager().getLastName() : "");
            response.setProjectManagerName(pmName.trim());
        }

        response.setIsBillable(project.getIsBillable());
        response.setIsActive("active".equals(project.getProjectStatus()));

        return response;
    }

    private ProjectDetailResponse mapToDetailResponse(Project project) {
        ProjectDetailResponse response = new ProjectDetailResponse();
        response.setId(project.getId());

        // Client info
        if (project.getClient() != null) {
            response.setClientId(project.getClient().getId());
            response.setClientName(project.getClient().getName());
        }

        // Project Info
        response.setProjectName(project.getProjectName());
        response.setProjectCode(project.getProjectCode());
        response.setProjectType(project.getProjectType());
        response.setDescription(project.getDescription());

        // Timeline
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setEstimatedDurationMonths(project.getEstimatedDurationMonths());
        response.setProjectStatus(project.getProjectStatus());

        // Financial
        response.setProjectBudget(project.getProjectBudget());
        response.setBillingRateType(project.getBillingRateType());
        response.setDefaultBillingRate(project.getDefaultBillingRate());
        response.setCurrency(project.getCurrency());

        // Management
        if (project.getProjectManager() != null) {
            response.setProjectManagerId(project.getProjectManager().getId());
            String pmName = (project.getProjectManager().getFirstName() != null ? project.getProjectManager().getFirstName() : "") +
                    " " + (project.getProjectManager().getLastName() != null ? project.getProjectManager().getLastName() : "");
            response.setProjectManagerName(pmName.trim());
        }

        // Metrics
        response.setTotalAllocatedResources(project.getTotalAllocatedResources());

        // Status
        response.setIsBillable(project.getIsBillable());
        response.setIsActive("active".equals(project.getProjectStatus()));

        // Audit
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());

        return response;
    }
}

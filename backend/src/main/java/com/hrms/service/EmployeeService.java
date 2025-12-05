package com.hrms.service;

import com.hrms.dto.CreateEmployeeRequest;
import com.hrms.entity.*;
import com.hrms.entity.employee.*;
import com.hrms.repository.*;
import com.hrms.repository.employee.IdentityDocumentTypeRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeHistoryRepository employeeHistoryRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeCodeSequenceRepository employeeCodeSequenceRepository;
    private final VendorRepository vendorRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final IdentityDocumentTypeRepository identityDocumentTypeRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                          EmployeeHistoryRepository employeeHistoryRepository,
                          PermissionGroupRepository permissionGroupRepository,
                          DepartmentRepository departmentRepository,
                          PositionRepository positionRepository,
                          EmployeeCodeSequenceRepository employeeCodeSequenceRepository,
                          VendorRepository vendorRepository,
                          ClientRepository clientRepository,
                          ProjectRepository projectRepository,
                          IdentityDocumentTypeRepository identityDocumentTypeRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.permissionGroupRepository = permissionGroupRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.employeeCodeSequenceRepository = employeeCodeSequenceRepository;
        this.vendorRepository = vendorRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.identityDocumentTypeRepository = identityDocumentTypeRepository;
    }

    @Transactional
    public Employee createEmployee(User user, Organization org) {
        Employee employee = new Employee(user, org);

        // Auto-generate employee code
        String employeeCode = generateEmployeeCode(org, null);
        employee.setEmployeeCode(employeeCode);

        // Set default joining date to today if not set
        if (employee.getJoiningDate() == null) {
            employee.setJoiningDate(LocalDate.now());
        }

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("orgadmin") || role.getName().equals("superadmin"));

        if (isAdmin) {
            PermissionGroup orgAdminFull = permissionGroupRepository.findByName("ORG_ADMIN_FULL")
                    .orElseThrow(() -> new RuntimeException("ORG_ADMIN_FULL group not found"));
            employee.getPermissionGroups().add(orgAdminFull);
        } else {
            PermissionGroup employeeBasic = permissionGroupRepository.findByName("EMPLOYEE_BASIC")
                    .orElseThrow(() -> new RuntimeException("EMPLOYEE_BASIC group not found"));
            employee.getPermissionGroups().add(employeeBasic);
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee createEmployee(User user, Organization org, CreateEmployeeRequest request) {
        Employee employee = new Employee(user, org);

        // Set personal details
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setMiddleName(request.getMiddleName());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setGender(request.getGender());
        employee.setNationality(request.getNationality());
        employee.setMaritalStatus(request.getMaritalStatus());
        employee.setBloodGroup(request.getBloodGroup());

        // Set contact details
        employee.setPersonalEmail(request.getPersonalEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        // Map legacy phone fields if needed, or just rely on new structure
        
        // Set department if provided
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(department);
        }

        // Auto-generate employee code based on department
        String employeeCode = generateEmployeeCode(org, department);
        employee.setEmployeeCode(employeeCode);

        // Set joining date
        if (request.getJoiningDate() != null) {
            employee.setJoiningDate(request.getJoiningDate());
        } else {
            employee.setJoiningDate(LocalDate.now());
        }

        // Set position if provided
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found"));
            employee.setPosition(position);
        }

        // Set manager if provided
        if (request.getReportsToId() != null) {
            Employee manager = employeeRepository.findById(request.getReportsToId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setReportsTo(manager);
        }

        // Set employment details
        if (request.getEmploymentType() != null) {
            employee.setEmploymentType(request.getEmploymentType());
        }
        if (request.getEmploymentStatus() != null) {
            employee.setEmploymentStatus(request.getEmploymentStatus());
        }

        // Set Vendor/Client/Project
        if (request.getVendorId() != null) {
            Vendor vendor = vendorRepository.findById(request.getVendorId())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            employee.setVendor(vendor);
        }
        if (request.getClientId() != null) {
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            employee.setClient(client);
        }
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            employee.setProject(project);
        }

        // Set contract details
        employee.setContractStartDate(request.getContractStartDate());
        employee.setContractEndDate(request.getContractEndDate());

        // Set probation details
        if (request.getIsProbation() != null && request.getIsProbation()) {
            // Validate probation dates
            if (request.getProbationStartDate() != null && request.getProbationEndDate() != null) {
                if (request.getProbationEndDate().isBefore(request.getProbationStartDate())) {
                    throw new IllegalArgumentException("Probation end date must be after start date");
                }
            }

            employee.setIsProbation(true);
            employee.setProbationStartDate(request.getProbationStartDate());
            employee.setProbationEndDate(request.getProbationEndDate());
            employee.setProbationStatus(request.getProbationStatus() != null ? request.getProbationStatus() : "active");
        }

        // Set compensation
        employee.setBasicSalary(request.getBasicSalary());
        if (request.getCurrency() != null) employee.setSalaryCurrency(request.getCurrency());
        if (request.getPayFrequency() != null) employee.setPayFrequency(request.getPayFrequency());

        // Set social profiles
        employee.setLinkedinProfile(request.getLinkedInProfile());
        employee.setGithubProfile(request.getGithubProfile());

        // --- Create Related Entities ---

        // 1. Addresses
        if (request.getCurrentAddressLine1() != null) {
            EmployeeAddress currentAddr = new EmployeeAddress();
            currentAddr.setEmployee(employee);
            currentAddr.setOrganization(org);
            currentAddr.setAddressType(EmployeeAddress.AddressType.CURRENT);
            currentAddr.setIsPrimary(true);
            currentAddr.setAddressLine1(request.getCurrentAddressLine1());
            currentAddr.setAddressLine2(request.getCurrentAddressLine2());
            currentAddr.setCity(request.getCurrentCity());
            currentAddr.setStateProvince(request.getCurrentState());
            currentAddr.setCountry(request.getCurrentCountry());
            currentAddr.setPostalCode(request.getCurrentPostalCode());
            employee.getAddresses().add(currentAddr);

            if (Boolean.TRUE.equals(request.getSameAsCurrentAddress())) {
                EmployeeAddress permAddr = new EmployeeAddress();
                permAddr.setEmployee(employee);
                permAddr.setOrganization(org);
                permAddr.setAddressType(EmployeeAddress.AddressType.PERMANENT);
                permAddr.setAddressLine1(request.getCurrentAddressLine1());
                permAddr.setAddressLine2(request.getCurrentAddressLine2());
                permAddr.setCity(request.getCurrentCity());
                permAddr.setStateProvince(request.getCurrentState());
                permAddr.setCountry(request.getCurrentCountry());
                permAddr.setPostalCode(request.getCurrentPostalCode());
                employee.getAddresses().add(permAddr);
            } else if (request.getPermanentAddressLine1() != null) {
                EmployeeAddress permAddr = new EmployeeAddress();
                permAddr.setEmployee(employee);
                permAddr.setOrganization(org);
                permAddr.setAddressType(EmployeeAddress.AddressType.PERMANENT);
                permAddr.setAddressLine1(request.getPermanentAddressLine1());
                permAddr.setAddressLine2(request.getPermanentAddressLine2());
                permAddr.setCity(request.getPermanentCity());
                permAddr.setStateProvince(request.getPermanentState());
                permAddr.setCountry(request.getPermanentCountry());
                permAddr.setPostalCode(request.getPermanentPostalCode());
                employee.getAddresses().add(permAddr);
            }
        }

        // 2. Emergency Contacts
        if (request.getEmergencyContactName() != null) {
            EmployeeEmergencyContact contact = new EmployeeEmergencyContact();
            contact.setEmployee(employee);
            contact.setOrganization(org);
            contact.setIsPrimary(true);
            contact.setContactName(request.getEmergencyContactName());
            
            try {
                if (request.getEmergencyContactRelationship() != null) {
                    contact.setRelationship(EmployeeEmergencyContact.Relationship.valueOf(request.getEmergencyContactRelationship().toUpperCase()));
                } else {
                    contact.setRelationship(EmployeeEmergencyContact.Relationship.OTHER);
                }
            } catch (IllegalArgumentException e) {
                contact.setRelationship(EmployeeEmergencyContact.Relationship.OTHER);
                contact.setOtherRelationship(request.getEmergencyContactRelationship());
            }
            
            contact.setPrimaryPhone(request.getEmergencyContactPhone());
            employee.getEmergencyContacts().add(contact);
        }
        if (request.getAlternateEmergencyContactName() != null) {
            EmployeeEmergencyContact contact = new EmployeeEmergencyContact();
            contact.setEmployee(employee);
            contact.setOrganization(org);
            contact.setIsPrimary(false);
            contact.setContactName(request.getAlternateEmergencyContactName());
            
            try {
                if (request.getAlternateEmergencyContactRelationship() != null) {
                    contact.setRelationship(EmployeeEmergencyContact.Relationship.valueOf(request.getAlternateEmergencyContactRelationship().toUpperCase()));
                } else {
                    contact.setRelationship(EmployeeEmergencyContact.Relationship.OTHER);
                }
            } catch (IllegalArgumentException e) {
                contact.setRelationship(EmployeeEmergencyContact.Relationship.OTHER);
                contact.setOtherRelationship(request.getAlternateEmergencyContactRelationship());
            }

            contact.setPrimaryPhone(request.getAlternateEmergencyContactPhone());
            employee.getEmergencyContacts().add(contact);
        }

        // 3. Bank Accounts
        if (request.getBankAccountNumber() != null) {
            EmployeeBankAccount bank = new EmployeeBankAccount();
            bank.setEmployee(employee);
            bank.setOrganization(org);
            bank.setIsPrimary(true);
            bank.setAccountPurpose(EmployeeBankAccount.AccountPurpose.SALARY);
            bank.setAccountNumber(request.getBankAccountNumber());
            bank.setAccountHolderName(request.getAccountHolderName());
            bank.setBankName(request.getBankName());
            bank.setBankBranch(request.getBankBranch());
            bank.setIfscCode(request.getIfscCode());
            bank.setSwiftCode(request.getSwiftCode());
            employee.getBankAccounts().add(bank);
        }

        // 4. Identity Documents
        createIdentityDoc(employee, org, "SSN", request.getSsnNumber());
        createIdentityDoc(employee, org, "PAN", request.getPanNumber());
        createIdentityDoc(employee, org, "AADHAAR", request.getAadharNumber());
        createIdentityDoc(employee, org, "UAN", request.getUanNumber());
        createIdentityDoc(employee, org, "DL_USA", request.getDriversLicenseNumber()); // Assuming US DL for now
        createIdentityDoc(employee, org, "PASSPORT", request.getPassportNumber());

        // Set permission groups if provided, otherwise use defaults
        if (request.getPermissionGroupIds() != null && !request.getPermissionGroupIds().isEmpty()) {
            List<PermissionGroup> groups = permissionGroupRepository.findAllById(request.getPermissionGroupIds());
            employee.getPermissionGroups().addAll(groups);
        } else {
            // Apply default permission groups
            boolean isAdmin = user.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("orgadmin") || role.getName().equals("superadmin"));

            if (isAdmin) {
                PermissionGroup orgAdminFull = permissionGroupRepository.findByName("ORG_ADMIN_FULL")
                        .orElseThrow(() -> new RuntimeException("ORG_ADMIN_FULL group not found"));
                employee.getPermissionGroups().add(orgAdminFull);
            } else {
                PermissionGroup employeeBasic = permissionGroupRepository.findByName("EMPLOYEE_BASIC")
                        .orElseThrow(() -> new RuntimeException("EMPLOYEE_BASIC group not found"));
                employee.getPermissionGroups().add(employeeBasic);
            }
        }

        return employeeRepository.save(employee);
    }

    private void createIdentityDoc(Employee employee, Organization org, String docTypeCode, String docNumber) {
        if (docNumber != null && !docNumber.isEmpty()) {
            Optional<IdentityDocumentType> typeOpt = identityDocumentTypeRepository.findByDocumentTypeCodeAndActiveTrue(docTypeCode);
            if (typeOpt.isPresent()) {
                EmployeeIdentityDocument doc = new EmployeeIdentityDocument();
                doc.setEmployee(employee);
                doc.setOrganization(org);
                doc.setDocumentType(typeOpt.get());
                doc.setDocumentNumber(docNumber);
                doc.setVerificationStatus(EmployeeIdentityDocument.VerificationStatus.PENDING);
                employee.getIdentityDocuments().add(doc);
            }
        }
    }

    @Transactional
    @CacheEvict(value = "reportingTrees", allEntries = true)
    public Employee updateReporting(Employee employee, Employee reportsTo, User changedBy) {
        String oldValue = employee.getReportsTo() != null ? employee.getReportsTo().getId().toString() : null;
        String newValue = reportsTo != null ? reportsTo.getId().toString() : null;

        employee.setReportsTo(reportsTo);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "reports_to", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateDepartment(Employee employee, Department dept, User changedBy) {
        String oldValue = employee.getDepartment() != null ? employee.getDepartment().getId().toString() : null;
        String newValue = dept != null ? dept.getId().toString() : null;

        employee.setDepartment(dept);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "department_id", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updatePosition(Employee employee, Position pos, User changedBy) {
        String oldValue = employee.getPosition() != null ? employee.getPosition().getId().toString() : null;
        String newValue = pos != null ? pos.getId().toString() : null;

        employee.setPosition(pos);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "position_id", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateEmploymentType(Employee employee, String type, User changedBy) {
        String oldValue = employee.getEmploymentType();
        String newValue = type;

        employee.setEmploymentType(type);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "employment_type", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateContractEndDate(Employee employee, LocalDate endDate, User changedBy) {
        String oldValue = employee.getContractEndDate() != null ? employee.getContractEndDate().toString() : null;
        String newValue = endDate != null ? endDate.toString() : null;

        employee.setContractEndDate(endDate);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "contract_end_date", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateClientName(Employee employee, String clientName, User changedBy) {
        String oldValue = employee.getClientName();
        String newValue = clientName;

        employee.setClientName(clientName);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "client_name", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateProject(Employee employee, String projectId, User changedBy) {
        String oldValue = employee.getProjectId();
        String newValue = projectId;

        employee.setProjectId(projectId);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "project_id", oldValue, newValue, changedBy);
        return updated;
    }

    /**
     * Check if assigning newManagerId as manager would create a circular reporting structure
     */
    public boolean wouldCreateCycle(UUID newManagerId, UUID employeeId) {
        if (newManagerId.equals(employeeId)) {
            return true; // Self-reference
        }

        Set<UUID> visited = new HashSet<>();
        UUID current = newManagerId;

        while (current != null) {
            if (current.equals(employeeId)) {
                return true; // Cycle detected: employee would be in their own management chain
            }

            if (!visited.add(current)) {
                // We've seen this ID before, there's a loop but it doesn't involve our employee
                return false;
            }

            Optional<Employee> manager = employeeRepository.findById(current);
            current = manager
                .flatMap(m -> Optional.ofNullable(m.getReportsTo()))
                .map(Employee::getId)
                .orElse(null);
        }

        return false;
    }

    @Cacheable(value = "reportingTrees", key = "#employeeId")
    public List<Employee> getReportingTree(UUID employeeId) {
        Employee manager = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Optimized: Load all employees in organization once (single query)
        List<Employee> allEmployees = employeeRepository.findByOrganization(manager.getOrganization());

        // Build tree in memory instead of recursive DB queries
        return collectReportsInMemory(employeeId, allEmployees);
    }

    private void collectReports(UUID managerId, List<Employee> tree) {
        List<Employee> directReports = employeeRepository.findByReportsToId(managerId);
        for (Employee report : directReports) {
            tree.add(report);
            collectReports(report.getId(), tree);
        }
    }

    private List<Employee> collectReportsInMemory(UUID managerId, List<Employee> allEmployees) {
        List<Employee> tree = new ArrayList<>();

        // Find direct reports in memory
        for (Employee emp : allEmployees) {
            if (emp.getReportsTo() != null && emp.getReportsTo().getId().equals(managerId)) {
                tree.add(emp);
                // Recursively collect their reports
                tree.addAll(collectReportsInMemory(emp.getId(), allEmployees));
            }
        }

        return tree;
    }

    public List<Employee> getEmployeesForOrganization(Organization organization) {
        return employeeRepository.findByOrganization(organization);
    }

    public Page<Employee> getEmployeesForOrganization(Organization organization, Pageable pageable) {
        return employeeRepository.findByOrganization(organization, pageable);
    }

    public Optional<Employee> getById(UUID employeeId) {
        return employeeRepository.findById(employeeId);
    }

    public Optional<Employee> getByUserId(UUID userId) {
        return employeeRepository.findByUser_Id(userId);
    }

    public List<EmployeeHistory> getHistoryForEmployee(Employee employee) {
        return employeeHistoryRepository.findByEmployeeOrderByChangedAtDesc(employee);
    }

    @Transactional
    public void recordHistory(Employee employee, String field, String oldValue, String newValue, User changedBy) {
        EmployeeHistory history = new EmployeeHistory(employee, field, oldValue, newValue, changedBy);
        employeeHistoryRepository.save(history);
    }

    public List<PermissionGroup> getPermissionGroupsForEmployee(Employee employee) {
        return new ArrayList<>(employee.getPermissionGroups());
    }

    @Transactional
    public void setPermissionGroupsForEmployee(Employee employee, List<PermissionGroup> groups) {
        employee.getPermissionGroups().clear();
        employee.getPermissionGroups().addAll(groups);
        employeeRepository.save(employee);
    }

    @Transactional
    public Employee extendProbation(Employee employee, LocalDate newEndDate, User changedBy) {
        // Validate new end date
        if (newEndDate == null) {
            throw new IllegalArgumentException("New probation end date cannot be null");
        }
        if (newEndDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("New probation end date cannot be in the past");
        }
        if (employee.getProbationEndDate() != null && newEndDate.isBefore(employee.getProbationEndDate())) {
            throw new IllegalArgumentException("New probation end date must be after the current end date");
        }

        String oldValue = employee.getProbationEndDate() != null ? employee.getProbationEndDate().toString() : null;
        String newValue = newEndDate.toString();

        employee.setProbationEndDate(newEndDate);
        employee.setProbationStatus("extended");
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "probation_end_date", oldValue, newValue, changedBy);
        recordHistory(employee, "probation_status", "active", "extended", changedBy);
        return updated;
    }

    @Transactional
    public Employee completeProbation(Employee employee, User changedBy) {
        String oldStatus = employee.getProbationStatus();

        employee.setProbationStatus("completed");
        employee.setIsProbation(false);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "probation_status", oldStatus, "completed", changedBy);
        recordHistory(employee, "is_probation", "true", "false", changedBy);
        return updated;
    }

    @Transactional
    public Employee terminateProbation(Employee employee, User changedBy) {
        String oldStatus = employee.getProbationStatus();

        employee.setProbationStatus("terminated");
        employee.setIsProbation(false);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "probation_status", oldStatus, "terminated", changedBy);
        recordHistory(employee, "is_probation", "true", "false", changedBy);
        return updated;
    }

    /**
     * Generate next employee code for the department
     * Format: {DEPT_CODE}{NUMBER} (e.g., IT001, HR002, FIN010)
     * If no department, uses EMP prefix (e.g., EMP001)
     */
    @Transactional
    public String generateEmployeeCode(Organization organization, Department department) {
        String prefix;

        if (department != null && department.getDepartmentCode() != null && !department.getDepartmentCode().isEmpty()) {
            prefix = department.getDepartmentCode().toUpperCase();
        } else {
            prefix = "EMP"; // Default for employees without department
        }

        // Find or create sequence for this department
        EmployeeCodeSequence sequence;
        if (department != null) {
            sequence = employeeCodeSequenceRepository.findByOrganizationAndDepartment(organization, department)
                    .orElseGet(() -> {
                        // Create new sequence starting at 1
                        EmployeeCodeSequence newSeq = new EmployeeCodeSequence(organization, department, prefix, 0);
                        return employeeCodeSequenceRepository.save(newSeq);
                    });
        } else {
            sequence = employeeCodeSequenceRepository.findByOrganizationAndDepartmentIsNull(organization)
                    .orElseGet(() -> {
                        // Create new sequence for employees without department
                        EmployeeCodeSequence newSeq = new EmployeeCodeSequence(organization, null, prefix, 0);
                        return employeeCodeSequenceRepository.save(newSeq);
                    });
        }

        // Increment and save
        sequence.setCurrentNumber(sequence.getCurrentNumber() + 1);
        employeeCodeSequenceRepository.save(sequence);

        // Format: PREFIX + 3-digit number (e.g., IT001, HR025)
        return String.format("%s%03d", prefix, sequence.getCurrentNumber());
    }

    /**
     * Get next available employee code (preview without incrementing)
     */
    public String getNextEmployeeCode(Organization organization, Department department) {
        String prefix;

        if (department != null && department.getDepartmentCode() != null && !department.getDepartmentCode().isEmpty()) {
            prefix = department.getDepartmentCode().toUpperCase();
        } else {
            prefix = "EMP";
        }

        // Find existing sequence
        Optional<EmployeeCodeSequence> sequenceOpt;
        if (department != null) {
            sequenceOpt = employeeCodeSequenceRepository.findByOrganizationAndDepartment(organization, department);
        } else {
            sequenceOpt = employeeCodeSequenceRepository.findByOrganizationAndDepartmentIsNull(organization);
        }

        int nextNumber = sequenceOpt.map(seq -> seq.getCurrentNumber() + 1).orElse(1);

        return String.format("%s%03d", prefix, nextNumber);
    }
}

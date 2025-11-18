package com.hrms.service;

import com.hrms.dto.client.*;
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
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<ClientListResponse> getAllClients(String email, Boolean activeOnly) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganization() == null) {
            throw new RuntimeException("User does not belong to an organization");
        }

        List<Client> clients = clientRepository.findByOrganizationId(user.getOrganization().getId());

        if (activeOnly != null && activeOnly) {
            clients = clients.stream()
                    .filter(c -> c.getDeletedAt() == null && c.getIsActive())
                    .collect(Collectors.toList());
        } else {
            clients = clients.stream()
                    .filter(c -> c.getDeletedAt() == null)
                    .collect(Collectors.toList());
        }

        return clients.stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientDetailResponse getClientById(UUID clientId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (!client.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return mapToDetailResponse(client);
    }

    @Transactional
    public ClientDetailResponse createClient(CreateClientRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganization() == null) {
            throw new RuntimeException("User does not belong to an organization");
        }

        Client client = new Client();
        client.setOrganization(user.getOrganization());

        // Generate client code if not provided
        if (request.getClientCode() == null || request.getClientCode().isEmpty()) {
            client.setClientCode(generateNextClientCode(email));
        } else {
            // Check uniqueness
            if (clientRepository.findByClientCode(request.getClientCode()).isPresent()) {
                throw new RuntimeException("Client code already exists");
            }
            client.setClientCode(request.getClientCode());
        }

        client.setName(request.getName());
        client.setClientType(request.getClientType());
        client.setIndustry(request.getIndustry());

        // Contact
        client.setPrimaryContactName(request.getPrimaryContactName());
        client.setPrimaryContactEmail(request.getPrimaryContactEmail());
        client.setPrimaryContactPhone(request.getPrimaryContactPhone());
        client.setAddressLine1(request.getAddressLine1());
        client.setAddressLine2(request.getAddressLine2());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setCountry(request.getCountry());
        client.setPostalCode(request.getPostalCode());

        // Business
        client.setTaxId(request.getTaxId());
        client.setWebsite(request.getWebsite());

        // Relationship
        client.setRelationshipStartDate(request.getRelationshipStartDate());
        client.setRelationshipStatus("active");

        // Account Manager
        if (request.getAccountManagerId() != null) {
            Employee accountManager = employeeRepository.findById(request.getAccountManagerId())
                    .orElseThrow(() -> new RuntimeException("Account manager not found"));
            client.setAccountManager(accountManager);
        }

        client.setIsActive(true);
        client.setIsStrategic(false);
        client.setCreatedAt(LocalDateTime.now());
        client.setCreatedBy(user);

        Client saved = clientRepository.save(client);
        return mapToDetailResponse(saved);
    }

    @Transactional
    public ClientDetailResponse updateClient(UUID clientId, UpdateClientRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (!client.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        client.setName(request.getName());
        client.setClientType(request.getClientType());
        client.setIndustry(request.getIndustry());

        // Contact
        client.setPrimaryContactName(request.getPrimaryContactName());
        client.setPrimaryContactEmail(request.getPrimaryContactEmail());
        client.setPrimaryContactPhone(request.getPrimaryContactPhone());
        client.setAddressLine1(request.getAddressLine1());
        client.setAddressLine2(request.getAddressLine2());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setCountry(request.getCountry());
        client.setPostalCode(request.getPostalCode());

        // Business
        client.setTaxId(request.getTaxId());
        client.setWebsite(request.getWebsite());

        // Relationship
        client.setRelationshipStartDate(request.getRelationshipStartDate());
        client.setRelationshipStatus(request.getRelationshipStatus());

        // Account Manager
        if (request.getAccountManagerId() != null) {
            Employee accountManager = employeeRepository.findById(request.getAccountManagerId())
                    .orElseThrow(() -> new RuntimeException("Account manager not found"));
            client.setAccountManager(accountManager);
        }

        // Status
        client.setIsActive(request.getIsActive());
        client.setIsStrategic(request.getIsStrategic());

        client.setUpdatedAt(LocalDateTime.now());
        client.setUpdatedBy(user);

        Client updated = clientRepository.save(client);
        return mapToDetailResponse(updated);
    }

    @Transactional
    public void deleteClient(UUID clientId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (!client.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        client.setDeletedAt(LocalDateTime.now());
        clientRepository.save(client);
    }

    public String generateNextClientCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Client> clients = clientRepository.findByOrganizationId(user.getOrganization().getId());
        int maxNumber = clients.stream()
                .map(Client::getClientCode)
                .filter(code -> code != null && code.matches("CLI\\d{4}"))
                .map(code -> Integer.parseInt(code.substring(3)))
                .max(Integer::compareTo)
                .orElse(0);

        return String.format("CLI%04d", maxNumber + 1);
    }

    private ClientListResponse mapToListResponse(Client client) {
        ClientListResponse response = new ClientListResponse();
        response.setId(client.getId());
        response.setName(client.getName());
        response.setClientCode(client.getClientCode());
        response.setClientType(client.getClientType());
        response.setIndustry(client.getIndustry());
        response.setPrimaryContactName(client.getPrimaryContactName());
        response.setPrimaryContactEmail(client.getPrimaryContactEmail());
        response.setPrimaryContactPhone(client.getPrimaryContactPhone());
        response.setRelationshipStatus(client.getRelationshipStatus());
        response.setRelationshipStartDate(client.getRelationshipStartDate());
        response.setTotalActiveProjects(client.getTotalActiveProjects());
        response.setTotalActiveResources(client.getTotalActiveResources());
        response.setIsActive(client.getIsActive());
        response.setIsStrategic(client.getIsStrategic());
        return response;
    }

    private ClientDetailResponse mapToDetailResponse(Client client) {
        ClientDetailResponse response = new ClientDetailResponse();
        response.setId(client.getId());
        response.setName(client.getName());
        response.setClientCode(client.getClientCode());
        response.setClientType(client.getClientType());
        response.setIndustry(client.getIndustry());

        // Contact
        response.setPrimaryContactName(client.getPrimaryContactName());
        response.setPrimaryContactEmail(client.getPrimaryContactEmail());
        response.setPrimaryContactPhone(client.getPrimaryContactPhone());
        response.setAddressLine1(client.getAddressLine1());
        response.setAddressLine2(client.getAddressLine2());
        response.setCity(client.getCity());
        response.setState(client.getState());
        response.setCountry(client.getCountry());
        response.setPostalCode(client.getPostalCode());

        // Business
        response.setTaxId(client.getTaxId());
        response.setWebsite(client.getWebsite());

        // Relationship
        response.setRelationshipStartDate(client.getRelationshipStartDate());
        response.setRelationshipStatus(client.getRelationshipStatus());
        if (client.getAccountManager() != null) {
            response.setAccountManagerId(client.getAccountManager().getId());
            response.setAccountManagerName(client.getAccountManager().getFullName());
        }

        // Metrics
        response.setTotalActiveProjects(client.getTotalActiveProjects());
        response.setTotalActiveResources(client.getTotalActiveResources());

        // Status
        response.setIsActive(client.getIsActive());
        response.setIsStrategic(client.getIsStrategic());

        // Audit
        response.setCreatedAt(client.getCreatedAt());
        response.setUpdatedAt(client.getUpdatedAt());

        return response;
    }
}

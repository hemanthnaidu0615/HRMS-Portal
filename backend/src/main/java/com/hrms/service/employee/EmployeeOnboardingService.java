package com.hrms.service.employee;

import com.hrms.dto.employee.request.*;
import com.hrms.dto.employee.response.*;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.employee.IdentityDocumentType;
import com.hrms.exception.BusinessException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.OrganizationRepository;
import com.hrms.service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Orchestrates the employee onboarding process.
 * Coordinates all sub-services for a unified onboarding experience.
 */
@Service
public class EmployeeOnboardingService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeOnboardingService.class);

    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeService employeeService;
    private final EmployeeAddressService addressService;
    private final EmployeeEmergencyContactService emergencyContactService;
    private final EmployeeIdentityDocumentService identityDocumentService;
    private final EmployeeBankAccountService bankAccountService;

    public EmployeeOnboardingService(
            EmployeeRepository employeeRepository,
            OrganizationRepository organizationRepository,
            EmployeeService employeeService,
            EmployeeAddressService addressService,
            EmployeeEmergencyContactService emergencyContactService,
            EmployeeIdentityDocumentService identityDocumentService,
            EmployeeBankAccountService bankAccountService
    ) {
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.employeeService = employeeService;
        this.addressService = addressService;
        this.emergencyContactService = emergencyContactService;
        this.identityDocumentService = identityDocumentService;
        this.bankAccountService = bankAccountService;
    }

    /**
     * Get complete onboarding status for an employee
     */
    public EmployeeOnboardingResponse getOnboardingStatus(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        return buildOnboardingResponse(employee);
    }

    /**
     * Get onboarding status for the current user's employee profile
     */
    public EmployeeOnboardingResponse getMyOnboardingStatus(User currentUser) {
        Employee employee = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> ResourceNotFoundException.employee(currentUser.getId()));

        return buildOnboardingResponse(employee);
    }

    /**
     * Get required document types based on employee's work country
     */
    public List<IdentityDocumentType> getRequiredDocumentTypes(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        String countryCode = employee.getWorkLocationCountry() != null
                ? employee.getWorkLocationCountry()
                : "USA"; // Default to USA

        return identityDocumentService.getRequiredDocumentsForOnboarding(countryCode);
    }

    /**
     * Get available document types for a country
     */
    public List<IdentityDocumentType> getAvailableDocumentTypes(String countryCode) {
        return identityDocumentService.getDocumentTypesForCountry(countryCode);
    }

    /**
     * Complete Step 1: Basic Information
     * Updates employee's personal information
     */
    @Transactional
    public EmployeeOnboardingResponse updateBasicInfo(UUID employeeId, CreateEmployeeOnboardingRequest request, User currentUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        // Update basic info fields
        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }
        if (request.getMiddleName() != null) {
            employee.setMiddleName(request.getMiddleName());
        }
        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }
        if (request.getPreferredName() != null) {
            employee.setPreferredName(request.getPreferredName());
        }
        if (request.getDateOfBirth() != null) {
            employee.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            employee.setGender(request.getGender());
        }
        if (request.getPronouns() != null) {
            employee.setPronouns(request.getPronouns());
        }
        if (request.getPersonalEmail() != null) {
            employee.setPersonalEmail(request.getPersonalEmail());
        }
        if (request.getPersonalPhone() != null) {
            employee.setPersonalPhone(request.getPersonalPhone());
        }

        employeeRepository.save(employee);
        logger.info("Updated basic info for employee {} by user {}", employeeId, currentUser.getId());

        return buildOnboardingResponse(employee);
    }

    /**
     * Complete Step 2: Add Address
     */
    @Transactional
    public EmployeeOnboardingResponse addAddress(UUID employeeId, AddressRequest request, User currentUser) {
        addressService.addAddress(employeeId, request, currentUser);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        return buildOnboardingResponse(employee);
    }

    /**
     * Complete Step 3: Add Emergency Contact
     */
    @Transactional
    public EmployeeOnboardingResponse addEmergencyContact(UUID employeeId, EmergencyContactRequest request, User currentUser) {
        emergencyContactService.addContact(employeeId, request, currentUser);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        return buildOnboardingResponse(employee);
    }

    /**
     * Complete Step 4: Add Identity Document
     */
    @Transactional
    public EmployeeOnboardingResponse addIdentityDocument(UUID employeeId, IdentityDocumentRequest request, User currentUser) {
        identityDocumentService.addDocument(employeeId, request, currentUser);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        return buildOnboardingResponse(employee);
    }

    /**
     * Complete Step 5: Add Bank Account
     */
    @Transactional
    public EmployeeOnboardingResponse addBankAccount(UUID employeeId, BankAccountRequest request, User currentUser) {
        bankAccountService.addAccount(employeeId, request, currentUser);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        return buildOnboardingResponse(employee);
    }

    /**
     * Complete onboarding - mark employee as fully onboarded
     */
    @Transactional
    public EmployeeOnboardingResponse completeOnboarding(UUID employeeId, User currentUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        // Verify all required steps are complete
        boolean hasAddress = addressService.hasAddress(employeeId);
        boolean hasEmergencyContact = emergencyContactService.hasEmergencyContact(employeeId);
        boolean hasIdentityDocument = identityDocumentService.hasIdentityDocument(employeeId);
        boolean hasBankAccount = bankAccountService.hasBankAccount(employeeId);

        if (!hasAddress) {
            throw BusinessException.onboardingNotComplete("address");
        }
        if (!hasEmergencyContact) {
            throw BusinessException.onboardingNotComplete("emergency_contact");
        }
        if (!hasIdentityDocument) {
            throw BusinessException.onboardingNotComplete("identity_documents");
        }
        if (!hasBankAccount) {
            throw BusinessException.onboardingNotComplete("bank_account");
        }

        // Update employee status
        employee.setOnboardingComplete(true);
        employee.setEmploymentStatus("ACTIVE");
        employeeRepository.save(employee);

        logger.info("Completed onboarding for employee {} by user {}", employeeId, currentUser.getId());

        return buildOnboardingResponse(employee);
    }

    /**
     * Get employees with incomplete onboarding in an organization
     */
    public List<EmployeeOnboardingResponse> getIncompleteOnboarding(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> ResourceNotFoundException.organization(organizationId));

        return employeeRepository.findByOrganization(organization)
                .stream()
                .filter(e -> !Boolean.TRUE.equals(e.getOnboardingComplete()))
                .map(this::buildOnboardingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Build complete onboarding response with progress
     */
    private EmployeeOnboardingResponse buildOnboardingResponse(Employee employee) {
        UUID employeeId = employee.getId();

        // Get related data
        List<AddressResponse> addresses = addressService.getAddressesByEmployeeId(employeeId);
        List<EmergencyContactResponse> contacts = emergencyContactService.getContactsByEmployeeId(employeeId);
        List<IdentityDocumentResponse> documents = identityDocumentService.getDocumentsByEmployeeId(employeeId);
        List<BankAccountResponse> accounts = bankAccountService.getAccountsByEmployeeId(employeeId);

        // Calculate progress
        boolean hasBasicInfo = employee.getFirstName() != null && employee.getLastName() != null;
        boolean hasAddress = !addresses.isEmpty();
        boolean hasEmergencyContact = !contacts.isEmpty();
        boolean hasIdentityDocument = !documents.isEmpty();
        boolean hasBankAccount = !accounts.isEmpty();
        boolean hasTaxInfo = false; // TODO: implement tax info service

        EmployeeOnboardingResponse.OnboardingProgress progress =
                EmployeeOnboardingResponse.calculateProgress(
                        hasBasicInfo,
                        hasAddress,
                        hasEmergencyContact,
                        hasIdentityDocument,
                        hasBankAccount,
                        hasTaxInfo
                );

        return EmployeeOnboardingResponse.builder()
                .employeeId(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .middleName(employee.getMiddleName())
                .lastName(employee.getLastName())
                .preferredName(employee.getPreferredName())
                .email(employee.getPersonalEmail())
                .workEmail(employee.getWorkEmail())
                .employmentType(employee.getEmploymentType())
                .employmentStatus(employee.getEmploymentStatus())
                .joiningDate(employee.getJoiningDate())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .positionTitle(employee.getPosition() != null ? employee.getPosition().getTitle() : null)
                .progress(progress)
                .addresses(addresses)
                .emergencyContacts(contacts)
                .identityDocuments(documents)
                .bankAccounts(accounts)
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}

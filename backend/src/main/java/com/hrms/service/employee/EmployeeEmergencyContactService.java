package com.hrms.service.employee;

import com.hrms.dto.employee.request.EmergencyContactRequest;
import com.hrms.dto.employee.response.EmergencyContactResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.entity.employee.EmployeeEmergencyContact;
import com.hrms.exception.BusinessException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.employee.EmployeeEmergencyContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeEmergencyContactService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeEmergencyContactService.class);

    private final EmployeeEmergencyContactRepository contactRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeEmergencyContactService(
            EmployeeEmergencyContactRepository contactRepository,
            EmployeeRepository employeeRepository
    ) {
        this.contactRepository = contactRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get all active emergency contacts for an employee (ordered by priority)
     */
    public List<EmergencyContactResponse> getContactsByEmployeeId(UUID employeeId) {
        return contactRepository.findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(employeeId)
                .stream()
                .map(EmergencyContactResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific contact by ID
     */
    public EmergencyContactResponse getContactById(UUID contactId) {
        EmployeeEmergencyContact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> ResourceNotFoundException.emergencyContact(contactId));
        return EmergencyContactResponse.fromEntity(contact);
    }

    /**
     * Add a new emergency contact
     */
    @Transactional
    public EmergencyContactResponse addContact(UUID employeeId, EmergencyContactRequest request, User currentUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        // Determine priority
        int maxPriority = contactRepository.findMaxPriorityByEmployeeId(employeeId);
        int newPriority = request.getPriority() != null ? request.getPriority() : maxPriority + 1;

        EmployeeEmergencyContact contact = EmployeeEmergencyContact.builder()
                .employee(employee)
                .organization(employee.getOrganization())
                .priority(newPriority)
                .isPrimary(newPriority == 1)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .relationship(EmployeeEmergencyContact.Relationship.valueOf(request.getRelationship()))
                .otherRelationship(request.getOtherRelationship())
                .primaryPhone(request.getPrimaryPhone())
                .secondaryPhone(request.getSecondaryPhone())
                .email(request.getEmail())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .stateProvince(request.getStateProvince())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .notes(request.getNotes())
                .createdBy(currentUser)
                .isActive(true)
                .build();

        EmployeeEmergencyContact saved = contactRepository.save(contact);
        logger.info("Added emergency contact {} for employee {}", saved.getId(), employeeId);

        return EmergencyContactResponse.fromEntity(saved);
    }

    /**
     * Update an existing emergency contact
     */
    @Transactional
    public EmergencyContactResponse updateContact(UUID contactId, EmergencyContactRequest request, User currentUser) {
        EmployeeEmergencyContact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> ResourceNotFoundException.emergencyContact(contactId));

        // Update fields
        if (request.getFirstName() != null) {
            contact.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            contact.setLastName(request.getLastName());
        }
        if (request.getRelationship() != null) {
            contact.setRelationship(EmployeeEmergencyContact.Relationship.valueOf(request.getRelationship()));
        }
        if (request.getOtherRelationship() != null) {
            contact.setOtherRelationship(request.getOtherRelationship());
        }
        if (request.getPrimaryPhone() != null) {
            contact.setPrimaryPhone(request.getPrimaryPhone());
        }
        if (request.getSecondaryPhone() != null) {
            contact.setSecondaryPhone(request.getSecondaryPhone());
        }
        if (request.getEmail() != null) {
            contact.setEmail(request.getEmail());
        }
        if (request.getAddressLine1() != null) {
            contact.setAddressLine1(request.getAddressLine1());
        }
        if (request.getCity() != null) {
            contact.setCity(request.getCity());
        }
        if (request.getStateProvince() != null) {
            contact.setStateProvince(request.getStateProvince());
        }
        if (request.getPostalCode() != null) {
            contact.setPostalCode(request.getPostalCode());
        }
        if (request.getCountry() != null) {
            contact.setCountry(request.getCountry());
        }
        if (request.getNotes() != null) {
            contact.setNotes(request.getNotes());
        }

        contact.setUpdatedBy(currentUser);
        EmployeeEmergencyContact saved = contactRepository.save(contact);
        logger.info("Updated emergency contact {} for employee {}", contactId, contact.getEmployee().getId());

        return EmergencyContactResponse.fromEntity(saved);
    }

    /**
     * Soft delete an emergency contact
     */
    @Transactional
    public void deleteContact(UUID contactId, User currentUser) {
        EmployeeEmergencyContact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> ResourceNotFoundException.emergencyContact(contactId));

        // Must have at least one emergency contact
        long count = contactRepository.countByEmployeeAndIsActiveTrue(contact.getEmployee());
        if (count <= 1) {
            throw BusinessException.minimumEmergencyContacts();
        }

        contact.setIsActive(false);
        contact.setUpdatedBy(currentUser);
        contactRepository.save(contact);

        // Re-prioritize remaining contacts
        reorderPriorities(contact.getEmployee().getId());

        logger.info("Deleted emergency contact {} for employee {}", contactId, contact.getEmployee().getId());
    }

    /**
     * Reorder contact priorities
     */
    @Transactional
    public void reorderContacts(UUID employeeId, List<UUID> orderedContactIds, User currentUser) {
        List<EmployeeEmergencyContact> contacts = contactRepository.findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(employeeId);

        for (int i = 0; i < orderedContactIds.size(); i++) {
            UUID contactId = orderedContactIds.get(i);
            contacts.stream()
                    .filter(c -> c.getId().equals(contactId))
                    .findFirst()
                    .ifPresent(c -> {
                        c.setPriority(orderedContactIds.indexOf(contactId) + 1);
                        c.setIsPrimary(orderedContactIds.indexOf(contactId) == 0);
                        c.setUpdatedBy(currentUser);
                        contactRepository.save(c);
                    });
        }

        logger.info("Reordered emergency contacts for employee {}", employeeId);
    }

    private void reorderPriorities(UUID employeeId) {
        List<EmployeeEmergencyContact> contacts = contactRepository.findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(employeeId);
        int priority = 1;
        for (EmployeeEmergencyContact contact : contacts) {
            contact.setPriority(priority);
            contact.setIsPrimary(priority == 1);
            contactRepository.save(contact);
            priority++;
        }
    }

    /**
     * Check if employee has at least one emergency contact
     */
    public boolean hasEmergencyContact(UUID employeeId) {
        return contactRepository.findPrimaryContactByEmployeeId(employeeId).isPresent();
    }
}

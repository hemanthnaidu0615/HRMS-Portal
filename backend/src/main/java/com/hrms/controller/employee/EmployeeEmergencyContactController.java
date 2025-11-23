package com.hrms.controller.employee;

import com.hrms.dto.employee.request.EmergencyContactRequest;
import com.hrms.dto.employee.response.EmergencyContactResponse;
import com.hrms.entity.User;
import com.hrms.service.employee.EmployeeEmergencyContactService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Employee Emergency Contacts
 */
@RestController
@RequestMapping("/api/employees/{employeeId}/emergency-contacts")
public class EmployeeEmergencyContactController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeEmergencyContactController.class);

    private final EmployeeEmergencyContactService contactService;

    public EmployeeEmergencyContactController(EmployeeEmergencyContactService contactService) {
        this.contactService = contactService;
    }

    /**
     * Get all emergency contacts for an employee (ordered by priority)
     */
    @GetMapping
    public ResponseEntity<List<EmergencyContactResponse>> getContacts(
            @PathVariable UUID employeeId
    ) {
        List<EmergencyContactResponse> contacts = contactService.getContactsByEmployeeId(employeeId);
        return ResponseEntity.ok(contacts);
    }

    /**
     * Get a specific emergency contact
     */
    @GetMapping("/{contactId}")
    public ResponseEntity<EmergencyContactResponse> getContact(
            @PathVariable UUID employeeId,
            @PathVariable UUID contactId
    ) {
        EmergencyContactResponse contact = contactService.getContactById(contactId);
        return ResponseEntity.ok(contact);
    }

    /**
     * Add a new emergency contact
     */
    @PostMapping
    public ResponseEntity<EmergencyContactResponse> addContact(
            @PathVariable UUID employeeId,
            @Valid @RequestBody EmergencyContactRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding emergency contact for employee: {}", employeeId);
        EmergencyContactResponse contact = contactService.addContact(employeeId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(contact);
    }

    /**
     * Update an emergency contact
     */
    @PutMapping("/{contactId}")
    public ResponseEntity<EmergencyContactResponse> updateContact(
            @PathVariable UUID employeeId,
            @PathVariable UUID contactId,
            @Valid @RequestBody EmergencyContactRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Updating emergency contact {} for employee: {}", contactId, employeeId);
        EmergencyContactResponse contact = contactService.updateContact(contactId, request, currentUser);
        return ResponseEntity.ok(contact);
    }

    /**
     * Delete an emergency contact
     */
    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> deleteContact(
            @PathVariable UUID employeeId,
            @PathVariable UUID contactId,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Deleting emergency contact {} for employee: {}", contactId, employeeId);
        contactService.deleteContact(contactId, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reorder emergency contacts
     */
    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderContacts(
            @PathVariable UUID employeeId,
            @RequestBody List<UUID> orderedContactIds,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Reordering emergency contacts for employee: {}", employeeId);
        contactService.reorderContacts(employeeId, orderedContactIds, currentUser);
        return ResponseEntity.ok().build();
    }
}

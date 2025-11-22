package com.hrms.controller.employee;

import com.hrms.dto.employee.request.AddressRequest;
import com.hrms.dto.employee.response.AddressResponse;
import com.hrms.entity.User;
import com.hrms.service.employee.EmployeeAddressService;
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
 * REST Controller for Employee Addresses
 */
@RestController
@RequestMapping("/api/employees/{employeeId}/addresses")
public class EmployeeAddressController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeAddressController.class);

    private final EmployeeAddressService addressService;

    public EmployeeAddressController(EmployeeAddressService addressService) {
        this.addressService = addressService;
    }

    /**
     * Get all addresses for an employee
     */
    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(
            @PathVariable UUID employeeId
    ) {
        List<AddressResponse> addresses = addressService.getAddressesByEmployeeId(employeeId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * Get a specific address
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponse> getAddress(
            @PathVariable UUID employeeId,
            @PathVariable UUID addressId
    ) {
        AddressResponse address = addressService.getAddressById(addressId);
        return ResponseEntity.ok(address);
    }

    /**
     * Add a new address
     */
    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            @PathVariable UUID employeeId,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding address for employee: {}", employeeId);
        AddressResponse address = addressService.addAddress(employeeId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(address);
    }

    /**
     * Update an address
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable UUID employeeId,
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Updating address {} for employee: {}", addressId, employeeId);
        AddressResponse address = addressService.updateAddress(addressId, request, currentUser);
        return ResponseEntity.ok(address);
    }

    /**
     * Delete an address
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable UUID employeeId,
            @PathVariable UUID addressId,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Deleting address {} for employee: {}", addressId, employeeId);
        addressService.deleteAddress(addressId, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Set an address as primary
     */
    @PostMapping("/{addressId}/set-primary")
    public ResponseEntity<AddressResponse> setPrimary(
            @PathVariable UUID employeeId,
            @PathVariable UUID addressId,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Setting address {} as primary for employee: {}", addressId, employeeId);
        AddressResponse address = addressService.setPrimaryAddress(addressId, currentUser);
        return ResponseEntity.ok(address);
    }
}

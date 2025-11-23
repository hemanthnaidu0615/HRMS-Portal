package com.hrms.service.employee;

import com.hrms.dto.employee.request.AddressRequest;
import com.hrms.dto.employee.response.AddressResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.entity.employee.EmployeeAddress;
import com.hrms.exception.BusinessException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.employee.EmployeeAddressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeAddressService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeAddressService.class);

    private final EmployeeAddressRepository addressRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeAddressService(
            EmployeeAddressRepository addressRepository,
            EmployeeRepository employeeRepository
    ) {
        this.addressRepository = addressRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get all active addresses for an employee
     */
    public List<AddressResponse> getAddressesByEmployeeId(UUID employeeId) {
        return addressRepository.findByEmployeeIdAndIsActiveTrue(employeeId)
                .stream()
                .map(AddressResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific address by ID
     */
    public AddressResponse getAddressById(UUID addressId) {
        EmployeeAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> ResourceNotFoundException.address(addressId));
        return AddressResponse.fromEntity(address);
    }

    /**
     * Add a new address for an employee
     */
    @Transactional
    public AddressResponse addAddress(UUID employeeId, AddressRequest request, User currentUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        EmployeeAddress.AddressType addressType = EmployeeAddress.AddressType.valueOf(request.getAddressType());

        // Check if address type already exists
        addressRepository.findActiveByEmployeeIdAndType(employeeId, addressType)
                .ifPresent(existing -> {
                    throw BusinessException.addressTypeExists(addressType.name());
                });

        EmployeeAddress address = EmployeeAddress.builder()
                .employee(employee)
                .organization(employee.getOrganization())
                .addressType(addressType)
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .addressLine3(request.getAddressLine3())
                .city(request.getCity())
                .stateProvince(request.getStateProvince())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .countryCode(request.getCountryCode())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .createdBy(currentUser)
                .isActive(true)
                .build();

        // If this is primary, unset other primary addresses
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            unsetPrimaryAddresses(employeeId);
        }

        EmployeeAddress saved = addressRepository.save(address);
        logger.info("Added {} address for employee {}", addressType, employeeId);

        return AddressResponse.fromEntity(saved);
    }

    /**
     * Update an existing address
     */
    @Transactional
    public AddressResponse updateAddress(UUID addressId, AddressRequest request, User currentUser) {
        EmployeeAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> ResourceNotFoundException.address(addressId));

        // Update fields
        if (request.getAddressLine1() != null) {
            address.setAddressLine1(request.getAddressLine1());
        }
        if (request.getAddressLine2() != null) {
            address.setAddressLine2(request.getAddressLine2());
        }
        if (request.getAddressLine3() != null) {
            address.setAddressLine3(request.getAddressLine3());
        }
        if (request.getCity() != null) {
            address.setCity(request.getCity());
        }
        if (request.getStateProvince() != null) {
            address.setStateProvince(request.getStateProvince());
        }
        if (request.getPostalCode() != null) {
            address.setPostalCode(request.getPostalCode());
        }
        if (request.getCountry() != null) {
            address.setCountry(request.getCountry());
        }
        if (request.getCountryCode() != null) {
            address.setCountryCode(request.getCountryCode());
        }
        if (request.getEffectiveFrom() != null) {
            address.setEffectiveFrom(request.getEffectiveFrom());
        }
        if (request.getEffectiveTo() != null) {
            address.setEffectiveTo(request.getEffectiveTo());
        }

        // Handle primary flag
        if (Boolean.TRUE.equals(request.getIsPrimary()) && !Boolean.TRUE.equals(address.getIsPrimary())) {
            unsetPrimaryAddresses(address.getEmployee().getId());
            address.setIsPrimary(true);
        }

        address.setUpdatedBy(currentUser);
        EmployeeAddress saved = addressRepository.save(address);
        logger.info("Updated address {} for employee {}", addressId, address.getEmployee().getId());

        return AddressResponse.fromEntity(saved);
    }

    /**
     * Soft delete an address
     */
    @Transactional
    public void deleteAddress(UUID addressId, User currentUser) {
        EmployeeAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> ResourceNotFoundException.address(addressId));

        address.setIsActive(false);
        address.setUpdatedBy(currentUser);
        addressRepository.save(address);

        logger.info("Deleted address {} for employee {}", addressId, address.getEmployee().getId());
    }

    /**
     * Set an address as primary
     */
    @Transactional
    public AddressResponse setPrimaryAddress(UUID addressId, User currentUser) {
        EmployeeAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> ResourceNotFoundException.address(addressId));

        unsetPrimaryAddresses(address.getEmployee().getId());
        address.setIsPrimary(true);
        address.setUpdatedBy(currentUser);

        EmployeeAddress saved = addressRepository.save(address);
        logger.info("Set address {} as primary for employee {}", addressId, address.getEmployee().getId());

        return AddressResponse.fromEntity(saved);
    }

    private void unsetPrimaryAddresses(UUID employeeId) {
        List<EmployeeAddress> addresses = addressRepository.findByEmployeeIdAndIsActiveTrue(employeeId);
        for (EmployeeAddress addr : addresses) {
            if (Boolean.TRUE.equals(addr.getIsPrimary())) {
                addr.setIsPrimary(false);
                addressRepository.save(addr);
            }
        }
    }

    /**
     * Check if employee has at least one address
     */
    public boolean hasAddress(UUID employeeId) {
        return addressRepository.countActiveAddressesByEmployeeId(employeeId) > 0;
    }
}

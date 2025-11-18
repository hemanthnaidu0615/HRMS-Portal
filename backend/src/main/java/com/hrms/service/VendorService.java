package com.hrms.service;

import com.hrms.dto.vendor.*;
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
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<VendorListResponse> getAllVendors(String email, Boolean activeOnly) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganization() == null) {
            throw new RuntimeException("User does not belong to an organization");
        }

        List<Vendor> vendors = vendorRepository.findByOrganizationId(user.getOrganization().getId());

        if (activeOnly != null && activeOnly) {
            vendors = vendors.stream()
                    .filter(v -> v.getDeletedAt() == null && v.getIsActive())
                    .collect(Collectors.toList());
        } else {
            vendors = vendors.stream()
                    .filter(v -> v.getDeletedAt() == null)
                    .collect(Collectors.toList());
        }

        return vendors.stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VendorDetailResponse getVendorById(UUID vendorId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (!vendor.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return mapToDetailResponse(vendor);
    }

    @Transactional
    public VendorDetailResponse createVendor(CreateVendorRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganization() == null) {
            throw new RuntimeException("User does not belong to an organization");
        }

        Vendor vendor = new Vendor();
        vendor.setOrganization(user.getOrganization());

        // Generate vendor code if not provided
        if (request.getVendorCode() == null || request.getVendorCode().isEmpty()) {
            vendor.setVendorCode(generateNextVendorCode(email));
        } else {
            // Check uniqueness
            if (vendorRepository.findByVendorCode(request.getVendorCode()).isPresent()) {
                throw new RuntimeException("Vendor code already exists");
            }
            vendor.setVendorCode(request.getVendorCode());
        }

        vendor.setName(request.getName());
        vendor.setVendorType(request.getVendorType());

        // Contact
        vendor.setPrimaryContactName(request.getPrimaryContactName());
        vendor.setPrimaryContactEmail(request.getPrimaryContactEmail());
        vendor.setPrimaryContactPhone(request.getPrimaryContactPhone());
        vendor.setAddressLine1(request.getAddressLine1());
        vendor.setAddressLine2(request.getAddressLine2());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setCountry(request.getCountry());
        vendor.setPostalCode(request.getPostalCode());

        // Business
        vendor.setTaxId(request.getTaxId());
        vendor.setBusinessRegistrationNumber(request.getBusinessRegistrationNumber());
        vendor.setWebsite(request.getWebsite());

        // Contract
        vendor.setContractStartDate(request.getContractStartDate());
        vendor.setContractEndDate(request.getContractEndDate());
        vendor.setContractStatus("active");

        // Billing
        vendor.setBillingType(request.getBillingType());
        vendor.setDefaultBillingRate(request.getDefaultBillingRate());
        vendor.setBillingCurrency("USD");
        vendor.setPaymentTerms(request.getPaymentTerms());

        // Multi-tier
        if (request.getParentVendorId() != null) {
            Vendor parentVendor = vendorRepository.findById(request.getParentVendorId())
                    .orElseThrow(() -> new RuntimeException("Parent vendor not found"));
            vendor.setParentVendor(parentVendor);
            vendor.setTierLevel(parentVendor.getTierLevel() + 1);
        } else {
            vendor.setTierLevel(1);
        }

        vendor.setIsActive(true);
        vendor.setIsPreferred(false);
        vendor.setCreatedAt(LocalDateTime.now());
        vendor.setCreatedBy(user);

        Vendor saved = vendorRepository.save(vendor);
        return mapToDetailResponse(saved);
    }

    @Transactional
    public VendorDetailResponse updateVendor(UUID vendorId, UpdateVendorRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (!vendor.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        vendor.setName(request.getName());
        vendor.setVendorType(request.getVendorType());

        // Contact
        vendor.setPrimaryContactName(request.getPrimaryContactName());
        vendor.setPrimaryContactEmail(request.getPrimaryContactEmail());
        vendor.setPrimaryContactPhone(request.getPrimaryContactPhone());
        vendor.setAddressLine1(request.getAddressLine1());
        vendor.setAddressLine2(request.getAddressLine2());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setCountry(request.getCountry());
        vendor.setPostalCode(request.getPostalCode());

        // Business
        vendor.setTaxId(request.getTaxId());
        vendor.setBusinessRegistrationNumber(request.getBusinessRegistrationNumber());
        vendor.setWebsite(request.getWebsite());

        // Contract
        vendor.setContractStartDate(request.getContractStartDate());
        vendor.setContractEndDate(request.getContractEndDate());
        vendor.setContractStatus(request.getContractStatus());

        // Billing
        vendor.setBillingType(request.getBillingType());
        vendor.setDefaultBillingRate(request.getDefaultBillingRate());
        vendor.setPaymentTerms(request.getPaymentTerms());

        // Multi-tier
        if (request.getParentVendorId() != null) {
            Vendor parentVendor = vendorRepository.findById(request.getParentVendorId())
                    .orElseThrow(() -> new RuntimeException("Parent vendor not found"));
            vendor.setParentVendor(parentVendor);
            vendor.setTierLevel(parentVendor.getTierLevel() + 1);
        }

        // Status
        vendor.setIsActive(request.getIsActive());
        vendor.setIsPreferred(request.getIsPreferred());

        vendor.setUpdatedAt(LocalDateTime.now());
        vendor.setUpdatedBy(user);

        Vendor updated = vendorRepository.save(vendor);
        return mapToDetailResponse(updated);
    }

    @Transactional
    public void deleteVendor(UUID vendorId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (!vendor.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        vendor.setDeletedAt(LocalDateTime.now());
        vendorRepository.save(vendor);
    }

    public String generateNextVendorCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Vendor> vendors = vendorRepository.findByOrganizationId(user.getOrganization().getId());
        int maxNumber = vendors.stream()
                .map(Vendor::getVendorCode)
                .filter(code -> code != null && code.matches("VEN\\d{4}"))
                .map(code -> Integer.parseInt(code.substring(3)))
                .max(Integer::compareTo)
                .orElse(0);

        return String.format("VEN%04d", maxNumber + 1);
    }

    private VendorListResponse mapToListResponse(Vendor vendor) {
        VendorListResponse response = new VendorListResponse();
        response.setId(vendor.getId());
        response.setName(vendor.getName());
        response.setVendorCode(vendor.getVendorCode());
        response.setVendorType(vendor.getVendorType());
        response.setPrimaryContactName(vendor.getPrimaryContactName());
        response.setPrimaryContactEmail(vendor.getPrimaryContactEmail());
        response.setPrimaryContactPhone(vendor.getPrimaryContactPhone());
        response.setContractStatus(vendor.getContractStatus());
        response.setContractStartDate(vendor.getContractStartDate());
        response.setContractEndDate(vendor.getContractEndDate());
        response.setDefaultBillingRate(vendor.getDefaultBillingRate());
        response.setBillingCurrency(vendor.getBillingCurrency());
        response.setTotalResourcesSupplied(vendor.getTotalResourcesSupplied());
        response.setActiveResourcesCount(vendor.getActiveResourcesCount());
        response.setIsActive(vendor.getIsActive());
        response.setIsPreferred(vendor.getIsPreferred());
        return response;
    }

    private VendorDetailResponse mapToDetailResponse(Vendor vendor) {
        VendorDetailResponse response = new VendorDetailResponse();
        response.setId(vendor.getId());
        response.setName(vendor.getName());
        response.setVendorCode(vendor.getVendorCode());
        response.setVendorType(vendor.getVendorType());

        // Contact
        response.setPrimaryContactName(vendor.getPrimaryContactName());
        response.setPrimaryContactEmail(vendor.getPrimaryContactEmail());
        response.setPrimaryContactPhone(vendor.getPrimaryContactPhone());
        response.setAddressLine1(vendor.getAddressLine1());
        response.setAddressLine2(vendor.getAddressLine2());
        response.setCity(vendor.getCity());
        response.setState(vendor.getState());
        response.setCountry(vendor.getCountry());
        response.setPostalCode(vendor.getPostalCode());

        // Business
        response.setTaxId(vendor.getTaxId());
        response.setBusinessRegistrationNumber(vendor.getBusinessRegistrationNumber());
        response.setWebsite(vendor.getWebsite());

        // Contract
        response.setContractStartDate(vendor.getContractStartDate());
        response.setContractEndDate(vendor.getContractEndDate());
        response.setContractStatus(vendor.getContractStatus());

        // Billing
        response.setBillingType(vendor.getBillingType());
        response.setDefaultBillingRate(vendor.getDefaultBillingRate());
        response.setBillingCurrency(vendor.getBillingCurrency());
        response.setPaymentTerms(vendor.getPaymentTerms());

        // Multi-tier
        if (vendor.getParentVendor() != null) {
            response.setParentVendorId(vendor.getParentVendor().getId());
            response.setParentVendorName(vendor.getParentVendor().getName());
        }
        response.setTierLevel(vendor.getTierLevel());

        // Metrics
        response.setTotalResourcesSupplied(vendor.getTotalResourcesSupplied());
        response.setActiveResourcesCount(vendor.getActiveResourcesCount());

        // Status
        response.setIsActive(vendor.getIsActive());
        response.setIsPreferred(vendor.getIsPreferred());

        // Audit
        response.setCreatedAt(vendor.getCreatedAt());
        response.setUpdatedAt(vendor.getUpdatedAt());

        return response;
    }
}

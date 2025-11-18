package com.hrms.controller;

import com.hrms.dto.vendor.*;
import com.hrms.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @GetMapping
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<List<VendorListResponse>> getAllVendors(
            @RequestParam(required = false) Boolean activeOnly,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<VendorListResponse> vendors = vendorService.getAllVendors(email, activeOnly);
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<VendorDetailResponse> getVendorById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        VendorDetailResponse vendor = vendorService.getVendorById(id, email);
        return ResponseEntity.ok(vendor);
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<VendorDetailResponse> createVendor(
            @RequestBody CreateVendorRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        VendorDetailResponse vendor = vendorService.createVendor(request, email);
        return ResponseEntity.ok(vendor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<VendorDetailResponse> updateVendor(
            @PathVariable UUID id,
            @RequestBody UpdateVendorRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        VendorDetailResponse vendor = vendorService.updateVendor(id, request, email);
        return ResponseEntity.ok(vendor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<Void> deleteVendor(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        vendorService.deleteVendor(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/codes/next")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<String> getNextVendorCode(Authentication authentication) {
        String email = authentication.getName();
        String nextCode = vendorService.generateNextVendorCode(email);
        return ResponseEntity.ok(nextCode);
    }
}

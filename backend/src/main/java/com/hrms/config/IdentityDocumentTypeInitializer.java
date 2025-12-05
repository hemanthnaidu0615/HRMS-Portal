package com.hrms.config;

import com.hrms.entity.employee.IdentityDocumentType;
import com.hrms.repository.employee.IdentityDocumentTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Initializes Identity Document Types if they don't exist.
 * Ensures the system has the necessary reference data for employee onboarding.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IdentityDocumentTypeInitializer implements CommandLineRunner {

    private final IdentityDocumentTypeRepository repository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking Identity Document Types...");

        // Check if we need to seed data
        if (repository.count() > 0) {
            log.info("Identity Document Types already exist. Skipping initialization.");
            return;
        }

        log.info("Seeding Identity Document Types...");

        List<IdentityDocumentType> types = Arrays.asList(
            // USA
            IdentityDocumentType.builder()
                .documentTypeCode("SSN")
                .documentTypeName("Social Security Number")
                .countryCode("USA")
                .countryName("United States")
                .formatRegex("^\\d{3}-?\\d{2}-?\\d{4}$")
                .formatExample("XXX-XX-XXXX")
                .category(IdentityDocumentType.DocumentCategory.TAX_ID)
                .requiredForPayroll(true)
                .requiredForTax(true)
                .hasExpiryDate(false)
                .build(),
            IdentityDocumentType.builder()
                .documentTypeCode("DL_USA")
                .documentTypeName("Driver's License (US)")
                .countryCode("USA")
                .countryName("United States")
                .formatExample("Varies by state")
                .category(IdentityDocumentType.DocumentCategory.DRIVING)
                .hasExpiryDate(true)
                .build(),
            IdentityDocumentType.builder()
                .documentTypeCode("PASSPORT")
                .documentTypeName("Passport")
                .category(IdentityDocumentType.DocumentCategory.PASSPORT)
                .hasExpiryDate(true)
                .universal(true)
                .build(),

            // India
            IdentityDocumentType.builder()
                .documentTypeCode("PAN")
                .documentTypeName("Permanent Account Number")
                .countryCode("IND")
                .countryName("India")
                .formatRegex("^[A-Z]{5}[0-9]{4}[A-Z]$")
                .formatExample("ABCDE1234F")
                .category(IdentityDocumentType.DocumentCategory.TAX_ID)
                .requiredForPayroll(true)
                .requiredForTax(true)
                .hasExpiryDate(false)
                .build(),
            IdentityDocumentType.builder()
                .documentTypeCode("AADHAAR")
                .documentTypeName("Aadhaar Number")
                .countryCode("IND")
                .countryName("India")
                .formatRegex("^\\d{4}\\s?\\d{4}\\s?\\d{4}$")
                .formatExample("XXXX XXXX XXXX")
                .category(IdentityDocumentType.DocumentCategory.NATIONAL_ID)
                .requiredForPayroll(true)
                .hasExpiryDate(false)
                .build(),
            IdentityDocumentType.builder()
                .documentTypeCode("UAN")
                .documentTypeName("Universal Account Number (PF)")
                .countryCode("IND")
                .countryName("India")
                .formatRegex("^\\d{12}$")
                .formatExample("XXXXXXXXXXXX")
                .category(IdentityDocumentType.DocumentCategory.TAX_ID)
                .requiredForPayroll(true)
                .hasExpiryDate(false)
                .build(),

            // UK
            IdentityDocumentType.builder()
                .documentTypeCode("NI_NUMBER")
                .documentTypeName("National Insurance Number")
                .countryCode("GBR")
                .countryName("United Kingdom")
                .formatRegex("^[A-Z]{2}[0-9]{6}[A-Z]$")
                .formatExample("AB123456C")
                .category(IdentityDocumentType.DocumentCategory.TAX_ID)
                .requiredForPayroll(true)
                .requiredForTax(true)
                .hasExpiryDate(false)
                .build()
        );

        repository.saveAll(types);
        log.info("Successfully seeded {} Identity Document Types.", types.size());
    }
}

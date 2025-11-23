package com.hrms.service;

import com.hrms.dto.employee.BulkEmployeeImportRequest;
import com.hrms.dto.employee.BulkImportResponse;
import com.hrms.dto.employee.BulkImportResponse.ImportRowResult;
import com.hrms.entity.*;
import com.hrms.entity.employee.EmployeeAddress;
import com.hrms.repository.*;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for bulk importing employees from CSV files.
 * Features:
 * - CSV parsing with validation
 * - Duplicate detection (by email and employee code)
 * - Department/Position/Manager resolution
 * - Automatic user account creation
 * - Detailed error reporting per row
 */
@Service
public class BulkEmployeeImportService {

    private static final Logger logger = LoggerFactory.getLogger(BulkEmployeeImportService.class);

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final Validator validator;

    public BulkEmployeeImportService(EmployeeRepository employeeRepository,
                                     UserRepository userRepository,
                                     DepartmentRepository departmentRepository,
                                     PositionRepository positionRepository,
                                     OrganizationRepository organizationRepository,
                                     RoleRepository roleRepository,
                                     Validator validator) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.validator = validator;
    }

    /**
     * Import employees from CSV file
     */
    @Transactional
    public BulkImportResponse importEmployeesFromCsv(MultipartFile file, UUID organizationId, boolean skipDuplicates) {
        logger.info("Starting bulk employee import for organization {}", organizationId);

        // Validate organization
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        // Parse CSV
        List<BulkEmployeeImportRequest> rows;
        try {
            rows = parseCsvFile(file);
        } catch (Exception e) {
            logger.error("Failed to parse CSV file: {}", e.getMessage(), e);
            return BulkImportResponse.failure("Failed to parse CSV file: " + e.getMessage());
        }

        if (rows.isEmpty()) {
            return BulkImportResponse.failure("CSV file is empty or has no valid data rows");
        }

        logger.info("Parsed {} rows from CSV", rows.size());

        // Process each row
        List<ImportRowResult> results = new ArrayList<>();
        int successCount = 0;
        int skippedCount = 0;

        // Pre-load lookups for efficiency
        Map<String, Department> departmentMap = loadDepartments(organization);
        Map<String, Position> positionMap = loadPositions(organization);
        Map<String, Employee> employeeByCodeMap = loadEmployeesByCode(organization);
        Set<String> existingEmails = loadExistingEmails();
        Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new IllegalStateException("EMPLOYEE role not found"));

        for (int i = 0; i < rows.size(); i++) {
            BulkEmployeeImportRequest row = rows.get(i);
            int rowNum = i + 2; // +2 for header row and 0-indexing

            try {
                ImportRowResult result = processRow(row, rowNum, organization, departmentMap, positionMap,
                        employeeByCodeMap, existingEmails, employeeRole, skipDuplicates);

                results.add(result);

                if ("success".equals(result.getStatus())) {
                    successCount++;
                    // Update caches for subsequent rows
                    existingEmails.add(row.getEmail().toLowerCase());
                    employeeByCodeMap.put(row.getEmployeeCode().toUpperCase(),
                            employeeRepository.findByEmployeeCode(row.getEmployeeCode()).orElse(null));
                } else if ("skipped".equals(result.getStatus())) {
                    skippedCount++;
                }

            } catch (Exception e) {
                logger.error("Error processing row {}: {}", rowNum, e.getMessage(), e);
                results.add(ImportRowResult.failed(rowNum, row.getEmployeeCode(), row.getEmail(),
                        List.of("Unexpected error: " + e.getMessage())));
            }
        }

        BulkImportResponse response = BulkImportResponse.success(rows.size(), successCount, results);
        response.setSkippedCount(skippedCount);

        logger.info("Bulk import completed: {} total, {} success, {} failed, {} skipped",
                rows.size(), successCount, rows.size() - successCount - skippedCount, skippedCount);

        return response;
    }

    /**
     * Parse CSV file to list of request objects
     */
    private List<BulkEmployeeImportRequest> parseCsvFile(MultipartFile file) throws Exception {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            HeaderColumnNameMappingStrategy<BulkEmployeeImportRequest> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(BulkEmployeeImportRequest.class);

            CsvToBean<BulkEmployeeImportRequest> csvToBean = new CsvToBeanBuilder<BulkEmployeeImportRequest>(reader)
                    .withMappingStrategy(strategy)
                    .withIgnoreLeadingWhiteSpace(true)
                    .withIgnoreEmptyLine(true)
                    .build();

            return csvToBean.parse();
        }
    }

    /**
     * Process a single CSV row
     */
    private ImportRowResult processRow(BulkEmployeeImportRequest row, int rowNum,
                                        Organization organization,
                                        Map<String, Department> departmentMap,
                                        Map<String, Position> positionMap,
                                        Map<String, Employee> employeeByCodeMap,
                                        Set<String> existingEmails,
                                        Role employeeRole,
                                        boolean skipDuplicates) {

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Validate required fields
        Set<ConstraintViolation<BulkEmployeeImportRequest>> violations = validator.validate(row);
        if (!violations.isEmpty()) {
            errors.addAll(violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.toList()));
        }

        // Check for duplicate employee code
        if (row.getEmployeeCode() != null && employeeByCodeMap.containsKey(row.getEmployeeCode().toUpperCase())) {
            if (skipDuplicates) {
                return ImportRowResult.skipped(rowNum, row.getEmployeeCode(), row.getEmail(),
                        "Employee code already exists: " + row.getEmployeeCode());
            } else {
                errors.add("Employee code already exists: " + row.getEmployeeCode());
            }
        }

        // Check for duplicate email
        if (row.getEmail() != null && existingEmails.contains(row.getEmail().toLowerCase())) {
            if (skipDuplicates) {
                return ImportRowResult.skipped(rowNum, row.getEmployeeCode(), row.getEmail(),
                        "Email already exists: " + row.getEmail());
            } else {
                errors.add("Email already exists: " + row.getEmail());
            }
        }

        // Resolve department
        Department department = null;
        if (row.getDepartmentCode() != null && !row.getDepartmentCode().isBlank()) {
            department = departmentMap.get(row.getDepartmentCode().toUpperCase());
            if (department == null) {
                warnings.add("Department not found: " + row.getDepartmentCode() + " (will be null)");
            }
        }

        // Resolve position
        Position position = null;
        if (row.getPositionCode() != null && !row.getPositionCode().isBlank()) {
            position = positionMap.get(row.getPositionCode().toUpperCase());
            if (position == null) {
                warnings.add("Position not found: " + row.getPositionCode() + " (will be null)");
            }
        }

        // Resolve manager
        Employee manager = null;
        if (row.getReportsToCode() != null && !row.getReportsToCode().isBlank()) {
            manager = employeeByCodeMap.get(row.getReportsToCode().toUpperCase());
            if (manager == null) {
                warnings.add("Manager not found: " + row.getReportsToCode() + " (will be null)");
            }
        }

        // Return if errors
        if (!errors.isEmpty()) {
            return ImportRowResult.failed(rowNum, row.getEmployeeCode(), row.getEmail(), errors);
        }

        // Create user
        User user = createUser(row, organization, employeeRole);
        userRepository.save(user);

        // Create employee
        Employee employee = createEmployee(row, organization, department, position, manager, user);
        Employee savedEmployee = employeeRepository.save(employee);

        // Create address if provided
        if (hasAddressData(row)) {
            EmployeeAddress address = createAddress(row, savedEmployee, organization);
            savedEmployee.getAddresses().add(address);
            employeeRepository.save(savedEmployee);
        }

        ImportRowResult result = ImportRowResult.success(rowNum, row.getEmployeeCode(), row.getEmail(), savedEmployee.getId());
        result.setWarnings(warnings);
        return result;
    }

    /**
     * Create User entity from import row
     */
    private User createUser(BulkEmployeeImportRequest row, Organization organization, Role employeeRole) {
        User user = new User();
        user.setEmail(row.getEmail().toLowerCase());
        user.setPassword(UUID.randomUUID().toString()); // Temporary password
        user.setEnabled(true);
        user.setMustChangePassword(true);
        user.setOrganization(organization);
        user.getRoles().add(employeeRole);
        return user;
    }

    /**
     * Create Employee entity from import row
     */
    private Employee createEmployee(BulkEmployeeImportRequest row, Organization organization,
                                     Department department, Position position, Employee manager, User user) {
        Employee employee = new Employee();

        // Required
        employee.setEmployeeCode(row.getEmployeeCode());
        employee.setFirstName(row.getFirstName());
        employee.setLastName(row.getLastName());
        employee.setUser(user);
        employee.setOrganization(organization);

        // Optional personal info
        employee.setMiddleName(row.getMiddleName());
        employee.setPreferredName(row.getPreferredName());
        employee.setDateOfBirth(row.getDateOfBirth());
        employee.setGender(row.getGender());
        employee.setMaritalStatus(row.getMaritalStatus());
        employee.setNationality(row.getNationality());
        employee.setPhoneNumber(row.getPhoneNumber());
        employee.setPersonalEmail(row.getPersonalEmail());

        // Employment details
        employee.setDepartment(department);
        employee.setPosition(position);
        employee.setDesignation(row.getDesignation());
        employee.setEmploymentType(row.getEmploymentType() != null ? row.getEmploymentType() : "full_time");
        employee.setEmploymentStatus(row.getEmploymentStatus() != null ? row.getEmploymentStatus() : "active");
        employee.setHireDate(row.getHireDate() != null ? row.getHireDate() : LocalDate.now());
        employee.setStartDate(row.getStartDate());
        employee.setProbationEndDate(row.getProbationEndDate());
        employee.setReportsTo(manager);

        // Compensation
        if (row.getSalary() != null && !row.getSalary().isBlank()) {
            try {
                employee.setBaseSalary(new BigDecimal(row.getSalary()));
            } catch (NumberFormatException e) {
                // Skip invalid salary
            }
        }
        employee.setPayFrequency(row.getPayFrequency());
        employee.setSalaryCurrency(row.getCurrency());

        // Work location
        employee.setWorkLocation(row.getWorkLocation());
        employee.setWorkMode(row.getWorkMode());

        // Status
        employee.setOnboardingStatus("pending_import_completion");

        return employee;
    }

    /**
     * Create Address entity from import row
     */
    private EmployeeAddress createAddress(BulkEmployeeImportRequest row, Employee employee, Organization organization) {
        return EmployeeAddress.builder()
                .employee(employee)
                .organization(organization)
                .addressType(EmployeeAddress.AddressType.CURRENT)
                .addressLine1(row.getAddressLine1())
                .addressLine2(row.getAddressLine2())
                .city(row.getCity())
                .stateProvince(row.getState())
                .country(row.getCountry() != null ? row.getCountry() : "United States")
                .countryCode(row.getCountryCode() != null ? row.getCountryCode() : "USA")
                .postalCode(row.getPostalCode())
                .isPrimary(true)
                .isCurrent(true)
                .build();
    }

    private boolean hasAddressData(BulkEmployeeImportRequest row) {
        return (row.getAddressLine1() != null && !row.getAddressLine1().isBlank()) ||
               (row.getCity() != null && !row.getCity().isBlank());
    }

    // ==================== Lookup Loaders ====================

    private Map<String, Department> loadDepartments(Organization organization) {
        return departmentRepository.findByOrganizationAndDeletedAtIsNull(organization)
                .stream()
                .filter(d -> d.getCode() != null)
                .collect(Collectors.toMap(d -> d.getCode().toUpperCase(), d -> d, (a, b) -> a));
    }

    private Map<String, Position> loadPositions(Organization organization) {
        return positionRepository.findByOrganization(organization)
                .stream()
                .filter(p -> p.getCode() != null)
                .collect(Collectors.toMap(p -> p.getCode().toUpperCase(), p -> p, (a, b) -> a));
    }

    private Map<String, Employee> loadEmployeesByCode(Organization organization) {
        return employeeRepository.findByOrganizationAndDeletedAtIsNull(organization)
                .stream()
                .collect(Collectors.toMap(e -> e.getEmployeeCode().toUpperCase(), e -> e, (a, b) -> a));
    }

    private Set<String> loadExistingEmails() {
        return userRepository.findAll()
                .stream()
                .map(u -> u.getEmail().toLowerCase())
                .collect(Collectors.toSet());
    }

    /**
     * Generate CSV template with headers
     */
    public String generateCsvTemplate() {
        return String.join(",",
                "employee_code",
                "first_name",
                "last_name",
                "email",
                "middle_name",
                "preferred_name",
                "date_of_birth",
                "gender",
                "marital_status",
                "nationality",
                "phone_number",
                "personal_email",
                "department_code",
                "position_code",
                "designation",
                "employment_type",
                "employment_status",
                "hire_date",
                "start_date",
                "probation_end_date",
                "reports_to_code",
                "salary",
                "pay_frequency",
                "currency",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "country",
                "country_code",
                "postal_code",
                "work_location",
                "work_mode"
        ) + "\n";
    }
}

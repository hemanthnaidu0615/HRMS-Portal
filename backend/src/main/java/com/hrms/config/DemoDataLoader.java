package com.hrms.config;

import com.hrms.entity.*;
import com.hrms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Demo Data Loader - Automatically seeds test data on application startup
 * Only runs when 'demo' profile is active
 * Usage: Run with --spring.profiles.active=demo or set SPRING_PROFILES_ACTIVE=demo
 */
@Configuration
@Profile("demo") // Only runs when demo profile is active
public class DemoDataLoader {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataLoader.class);

    @Bean
    CommandLineRunner loadDemoData(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            PositionRepository positionRepository,
            EmployeeRepository employeeRepository,
            ClientRepository clientRepository,
            VendorRepository vendorRepository,
            ProjectRepository projectRepository,
            PermissionGroupRepository permissionGroupRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            // Check if demo data already exists
            if (organizationRepository.findAll().stream()
                    .anyMatch(org -> org.getName().startsWith("Demo "))) {
                logger.info("Demo data already exists, skipping data load...");
                return;
            }

            logger.info("======================================");
            logger.info("Loading demo data...");
            logger.info("======================================");

            // Use simple password "12345" for all demo accounts
            String demoPassword = passwordEncoder.encode("12345");

            // Get system roles
            Role orgAdminRole = roleRepository.findByNameAndSystemRoleTrue("ORGADMIN")
                    .orElseThrow(() -> new RuntimeException("ORGADMIN role not found"));
            Role employeeRole = roleRepository.findByNameAndSystemRoleTrue("EMPLOYEE")
                    .orElseThrow(() -> new RuntimeException("EMPLOYEE role not found"));

            // Get permission groups
            PermissionGroup employeeBasicGroup = permissionGroupRepository.findByName("EMPLOYEE_BASIC")
                    .orElseThrow(() -> new RuntimeException("EMPLOYEE_BASIC permission group not found"));
            PermissionGroup orgHrGroup = permissionGroupRepository.findByName("ORG_HR")
                    .orElseThrow(() -> new RuntimeException("ORG_HR permission group not found"));
            PermissionGroup orgAdminFullGroup = permissionGroupRepository.findByName("ORG_ADMIN_FULL")
                    .orElseThrow(() -> new RuntimeException("ORG_ADMIN_FULL permission group not found"));

            // ===== CREATE 10 ORGANIZATIONS WITH ORG ADMINS =====
            List<String> orgNames = Arrays.asList(
                    "Demo Tech Solutions Inc",
                    "Demo Healthcare Systems",
                    "Demo Financial Services",
                    "Demo Retail Corp",
                    "Demo Manufacturing Ltd",
                    "Demo Consulting Group",
                    "Demo Education Platform",
                    "Demo Logistics Pro",
                    "Demo Media & Entertainment",
                    "Demo Startup Hub"
            );

            Map<String, Organization> organizations = new HashMap<>();
            Map<String, Employee> orgAdmins = new HashMap<>();

            int adminCounter = 1;
            for (String orgName : orgNames) {
                Organization org = new Organization(orgName);
                organizationRepository.save(org);
                organizations.put(orgName, org);
                logger.info("Created organization: {}", orgName);

                // Create org admin for each organization
                String orgCode = orgName.substring(5, Math.min(9, orgName.length())).toUpperCase();
                String email = "admin" + adminCounter + "@" + orgCode.toLowerCase().replace(" ", "") + ".com";

                Employee orgAdmin = createEmployeeWithPermissions(
                        email, demoPassword, "ADMIN-" + String.format("%03d", adminCounter),
                        "Admin", "User " + adminCounter, email, "+1-555-" + String.format("%04d", 1000 + adminCounter),
                        "internal", "active", LocalDate.of(2023, 1, 1),
                        null, null, null, null, null, null, null, null,
                        "Organization Administrator", new BigDecimal("95000"), "USD",
                        adminCounter % 2 == 0 ? "Female" : "Male", LocalDate.of(1985, 1, 15), "USA",
                        false, null, null, null, null, null,
                        org, orgAdminRole, Collections.singleton(orgAdminFullGroup),
                        userRepository, employeeRepository
                );

                orgAdmins.put(orgName, orgAdmin);
                logger.info("Created org admin for {}: {}", orgName, email);
                adminCounter++;
            }

            // Work with first three organizations for detailed employee data
            Organization org1 = organizations.get("Demo Tech Solutions Inc");
            Organization org2 = organizations.get("Demo Healthcare Systems");
            Organization org3 = organizations.get("Demo Financial Services");

            Employee orgAdmin1 = orgAdmins.get("Demo Tech Solutions Inc");
            Employee orgAdmin2 = orgAdmins.get("Demo Healthcare Systems");
            Employee orgAdmin3 = orgAdmins.get("Demo Financial Services");

            // ===== CREATE DEPARTMENTS FOR ORG1 =====
            Department deptIT1 = createDepartment("Information Technology", org1, departmentRepository);
            Department deptHR1 = createDepartment("Human Resources", org1, departmentRepository);
            Department deptFin1 = createDepartment("Finance", org1, departmentRepository);
            Department deptSales1 = createDepartment("Sales & Marketing", org1, departmentRepository);

            // ===== CREATE POSITIONS FOR ORG1 =====
            Position posManager1 = createPosition("Engineering Manager", "Manager", org1, positionRepository);
            Position posTeamLead1 = createPosition("Team Lead", "Manager", org1, positionRepository);
            Position posSeniorDev1 = createPosition("Senior Software Engineer", "Senior", org1, positionRepository);
            Position posDev1 = createPosition("Software Engineer", "Mid", org1, positionRepository);
            Position posJuniorDev1 = createPosition("Junior Software Engineer", "Junior", org1, positionRepository);
            Position posHRManager1 = createPosition("HR Manager", "Manager", org1, positionRepository);
            Position posHRExecutive1 = createPosition("HR Executive", "Executive", org1, positionRepository);

            // ===== CREATE DEPARTMENTS FOR ORG2 =====
            Department deptMedical2 = createDepartment("Medical Services", org2, departmentRepository);
            Department deptHR2 = createDepartment("Human Resources", org2, departmentRepository);
            Department deptIT2 = createDepartment("IT Department", org2, departmentRepository);

            // ===== CREATE POSITIONS FOR ORG2 =====
            Position posDirector2 = createPosition("Medical Director", "Director", org2, positionRepository);
            Position posNurse2 = createPosition("Senior Nurse", "Senior", org2, positionRepository);
            Position posIT2 = createPosition("IT Specialist", "Mid", org2, positionRepository);

            // ===== CREATE DEPARTMENTS FOR ORG3 =====
            Department deptFinance3 = createDepartment("Finance Operations", org3, departmentRepository);
            Department deptCompliance3 = createDepartment("Compliance", org3, departmentRepository);

            // ===== CREATE POSITIONS FOR ORG3 =====
            Position posAnalyst3 = createPosition("Financial Analyst", "Mid", org3, positionRepository);
            Position posSeniorAnalyst3 = createPosition("Senior Financial Analyst", "Senior", org3, positionRepository);

            // ===== CREATE CLIENTS =====
            Client client1 = createClient("Demo Client Corp", "CL001", "John Smith", "john@democlient.com", "+1-555-0101", org1, clientRepository);
            Client client2 = createClient("Demo International Ltd", "CL002", "Sarah Johnson", "sarah@demointl.com", "+1-555-0102", org1, clientRepository);
            Client client3 = createClient("Demo Enterprise Solutions", "CL003", "Michael Brown", "michael@demoent.com", "+1-555-0103", org1, clientRepository);

            // ===== CREATE VENDORS =====
            Vendor vendor1 = createVendor("Demo Staffing Solutions", "VN001", "Emily Davis", "emily@demostaffing.com", "+1-555-0201", org1, vendorRepository);
            Vendor vendor2 = createVendor("Demo Tech Contractors", "VN002", "David Wilson", "david@demotechcon.com", "+1-555-0202", org1, vendorRepository);

            // ===== CREATE PROJECTS =====
            Project project1 = createProject("Demo ERP Implementation", "PRJ001", "Enterprise resource planning system",
                    LocalDate.of(2024, 1, 1), "active", client1, org1, projectRepository);
            Project project2 = createProject("Demo Mobile App", "PRJ002", "Customer mobile application",
                    LocalDate.of(2024, 2, 1), "active", client2, org1, projectRepository);
            Project project3 = createProject("Demo Cloud Migration", "PRJ003", "Infrastructure cloud migration",
                    LocalDate.of(2024, 3, 1), "active", client3, org1, projectRepository);

            // Track employees for document request permissions
            List<Employee> documentRequesters = new ArrayList<>();

            // ===== CREATE 30 EMPLOYEES ACROSS ORGANIZATIONS =====

            // ========== ORG1: DEMO TECH SOLUTIONS (15 employees) ==========

            // Engineering Manager with document request permission
            Employee emp1 = createEmployeeWithPermissions(
                    "bob.manager@demotech.com", demoPassword, "EMP-001",
                    "Bob", "Manager", "bob.manager@personal.com", "+1-555-2001",
                    "internal", "active", LocalDate.of(2023, 6, 1),
                    deptIT1, posManager1, orgAdmin1, null, null, null, null, null,
                    "Engineering Manager", new BigDecimal("95000"), "USD",
                    "Male", LocalDate.of(1985, 5, 15), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, new HashSet<>(Arrays.asList(employeeBasicGroup, orgHrGroup)),
                    userRepository, employeeRepository
            );
            documentRequesters.add(emp1);

            // Team Lead with document request permission
            Employee emp2 = createEmployeeWithPermissions(
                    "sarah.lead@demotech.com", demoPassword, "EMP-002",
                    "Sarah", "Thompson", "sarah.lead@personal.com", "+1-555-2002",
                    "internal", "active", LocalDate.of(2023, 7, 1),
                    deptIT1, posTeamLead1, emp1, null, null, null, null, null,
                    "Team Lead", new BigDecimal("88000"), "USD",
                    "Female", LocalDate.of(1988, 8, 20), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, new HashSet<>(Arrays.asList(employeeBasicGroup, orgHrGroup)),
                    userRepository, employeeRepository
            );
            documentRequesters.add(emp2);

            // Senior Software Engineer
            Employee emp3 = createEmployeeWithPermissions(
                    "john.senior@demotech.com", demoPassword, "EMP-003",
                    "John", "Anderson", "john.senior@personal.com", "+1-555-2003",
                    "internal", "active", LocalDate.of(2022, 3, 15),
                    deptIT1, posSeniorDev1, emp2, null, null, null, null, null,
                    "Senior Software Engineer", new BigDecimal("85000"), "USD",
                    "Male", LocalDate.of(1990, 3, 10), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Software Engineer
            Employee emp4 = createEmployeeWithPermissions(
                    "lisa.dev@demotech.com", demoPassword, "EMP-004",
                    "Lisa", "Chen", "lisa.dev@personal.com", "+1-555-2004",
                    "internal", "active", LocalDate.of(2023, 9, 1),
                    deptIT1, posDev1, emp2, null, null, null, null, null,
                    "Software Engineer", new BigDecimal("75000"), "USD",
                    "Female", LocalDate.of(1993, 7, 22), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Junior Developer on Probation
            createEmployeeWithPermissions(
                    "mike.junior@demotech.com", demoPassword, "EMP-005",
                    "Mike", "Rodriguez", "mike.junior@personal.com", "+1-555-2005",
                    "internal", "active", LocalDate.of(2024, 9, 1),
                    deptIT1, posJuniorDev1, emp2, null, null, null, null, null,
                    "Junior Software Engineer", new BigDecimal("60000"), "USD",
                    "Male", LocalDate.of(1998, 12, 5), "USA",
                    true, LocalDate.of(2024, 9, 1), LocalDate.of(2025, 3, 1), "active", null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Intern
            createEmployeeWithPermissions(
                    "emma.intern@demotech.com", demoPassword, "EMP-006",
                    "Emma", "Wilson", "emma.intern@personal.com", "+1-555-2006",
                    "internal", "active", LocalDate.of(2024, 6, 1),
                    deptIT1, posJuniorDev1, emp2, null, null, null, null, null,
                    "Software Engineering Intern", new BigDecimal("45000"), "USD",
                    "Female", LocalDate.of(2001, 4, 18), "USA",
                    true, LocalDate.of(2024, 6, 1), LocalDate.of(2024, 12, 1), "active", null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // HR Manager with document request permission
            Employee emp7 = createEmployeeWithPermissions(
                    "rachel.hr@demotech.com", demoPassword, "EMP-007",
                    "Rachel", "Brown", "rachel.hr@personal.com", "+1-555-2007",
                    "internal", "active", LocalDate.of(2022, 1, 15),
                    deptHR1, posHRManager1, orgAdmin1, null, null, null, null, null,
                    "HR Manager", new BigDecimal("80000"), "USD",
                    "Female", LocalDate.of(1987, 11, 25), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, new HashSet<>(Arrays.asList(employeeBasicGroup, orgHrGroup)),
                    userRepository, employeeRepository
            );
            documentRequesters.add(emp7);

            // HR Executive
            createEmployeeWithPermissions(
                    "david.hr@demotech.com", demoPassword, "EMP-008",
                    "David", "Martinez", "david.hr@personal.com", "+1-555-2008",
                    "internal", "active", LocalDate.of(2023, 5, 10),
                    deptHR1, posHRExecutive1, emp7, null, null, null, null, null,
                    "HR Executive", new BigDecimal("60000"), "USD",
                    "Male", LocalDate.of(1995, 7, 18), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Contractual Employee 1
            createEmployeeWithPermissions(
                    "susan.contract@demotech.com", demoPassword, "EMP-009",
                    "Susan", "White", "susan.contract@personal.com", "+1-555-2009",
                    "contractual", "active", LocalDate.of(2024, 1, 1),
                    deptIT1, posDev1, emp1, null, null, null, null, null,
                    "Contract Software Engineer", new BigDecimal("78000"), "USD",
                    "Female", LocalDate.of(1992, 4, 12), "USA",
                    false, null, null, null, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Contractual Employee 2
            createEmployeeWithPermissions(
                    "tom.contract@demotech.com", demoPassword, "EMP-010",
                    "Tom", "Garcia", "tom.contract@personal.com", "+1-555-2010",
                    "contractual", "active", LocalDate.of(2024, 3, 1),
                    deptIT1, posDev1, emp1, null, null, null, null, null,
                    "Contract QA Engineer", new BigDecimal("70000"), "USD",
                    "Male", LocalDate.of(1991, 9, 30), "USA",
                    false, null, null, null, LocalDate.of(2024, 3, 1), LocalDate.of(2025, 2, 28),
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Vendor Employee 1
            createEmployeeWithPermissions(
                    "alice.vendor@demotech.com", demoPassword, "EMP-011",
                    "Alice", "Taylor", "alice.vendor@demostaffing.com", "+1-555-2011",
                    "vendor", "active", LocalDate.of(2024, 2, 1),
                    deptIT1, posDev1, emp1, vendor1, null, null, null, null,
                    "Vendor Developer", new BigDecimal("72000"), "USD",
                    "Female", LocalDate.of(1994, 2, 14), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Vendor Employee 2
            createEmployeeWithPermissions(
                    "chris.vendor@demotech.com", demoPassword, "EMP-012",
                    "Chris", "Johnson", "chris.vendor@demotechcon.com", "+1-555-2012",
                    "vendor", "active", LocalDate.of(2024, 4, 1),
                    deptIT1, posDev1, emp1, vendor2, null, null, null, null,
                    "Vendor DevOps Engineer", new BigDecimal("75000"), "USD",
                    "Male", LocalDate.of(1992, 6, 22), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Client Project Employee
            createEmployeeWithPermissions(
                    "nancy.client@demotech.com", demoPassword, "EMP-013",
                    "Nancy", "Lee", "nancy.lee@democlient.com", "+1-555-2013",
                    "client", "active", LocalDate.of(2024, 1, 15),
                    deptIT1, posSeniorDev1, emp1, null, client1, null, project1, "PRJ001",
                    "Client Project Lead", new BigDecimal("92000"), "USD",
                    "Female", LocalDate.of(1989, 12, 5), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Sub-Vendor Employee
            createEmployeeWithPermissions(
                    "kevin.subvendor@demotech.com", demoPassword, "EMP-014",
                    "Kevin", "Moore", "kevin.moore@subvendor.com", "+1-555-2014",
                    "sub_vendor", "active", LocalDate.of(2024, 5, 1),
                    deptIT1, posJuniorDev1, emp2, vendor1, null, null, null, null,
                    "Sub-Vendor Junior Dev", new BigDecimal("58000"), "USD",
                    "Male", LocalDate.of(1996, 8, 15), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Finance Employee
            createEmployeeWithPermissions(
                    "jennifer.finance@demotech.com", demoPassword, "EMP-015",
                    "Jennifer", "Kim", "jennifer.finance@personal.com", "+1-555-2015",
                    "internal", "active", LocalDate.of(2023, 2, 1),
                    deptFin1, posDev1, orgAdmin1, null, null, null, null, null,
                    "Financial Analyst", new BigDecimal("70000"), "USD",
                    "Female", LocalDate.of(1990, 3, 28), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // ========== ORG2: DEMO HEALTHCARE SYSTEMS (10 employees) ==========

            // Medical Director
            createEmployeeWithPermissions(
                    "dr.james@demohealthcare.com", demoPassword, "EMP-016",
                    "James", "Williams", "dr.james@personal.com", "+1-555-3001",
                    "internal", "active", LocalDate.of(2022, 1, 10),
                    deptMedical2, posDirector2, orgAdmin2, null, null, null, null, null,
                    "Medical Director", new BigDecimal("150000"), "USD",
                    "Male", LocalDate.of(1980, 5, 12), "USA",
                    false, null, null, null, null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Senior Nurse 1
            createEmployeeWithPermissions(
                    "mary.nurse@demohealthcare.com", demoPassword, "EMP-017",
                    "Mary", "Davis", "mary.davis@personal.com", "+1-555-3002",
                    "internal", "active", LocalDate.of(2021, 6, 15),
                    deptMedical2, posNurse2, orgAdmin2, null, null, null, null, null,
                    "Senior Nurse", new BigDecimal("75000"), "USD",
                    "Female", LocalDate.of(1985, 8, 20), "USA",
                    false, null, null, null, null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Senior Nurse 2
            createEmployeeWithPermissions(
                    "patricia.nurse@demohealthcare.com", demoPassword, "EMP-018",
                    "Patricia", "Miller", "patricia.miller@personal.com", "+1-555-3003",
                    "internal", "active", LocalDate.of(2022, 3, 20),
                    deptMedical2, posNurse2, orgAdmin2, null, null, null, null, null,
                    "Senior Nurse", new BigDecimal("75000"), "USD",
                    "Female", LocalDate.of(1987, 11, 15), "USA",
                    false, null, null, null, null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // IT Specialist
            createEmployeeWithPermissions(
                    "robert.it@demohealthcare.com", demoPassword, "EMP-019",
                    "Robert", "Anderson", "robert.anderson@personal.com", "+1-555-3004",
                    "internal", "active", LocalDate.of(2023, 8, 1),
                    deptIT2, posIT2, orgAdmin2, null, null, null, null, null,
                    "IT Specialist", new BigDecimal("68000"), "USD",
                    "Male", LocalDate.of(1992, 4, 25), "USA",
                    false, null, null, null, null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // HR Manager
            createEmployeeWithPermissions(
                    "linda.hr@demohealthcare.com", demoPassword, "EMP-020",
                    "Linda", "Wilson", "linda.wilson@personal.com", "+1-555-3005",
                    "internal", "active", LocalDate.of(2022, 5, 10),
                    deptHR2, posNurse2, orgAdmin2, null, null, null, null, null,
                    "HR Manager", new BigDecimal("78000"), "USD",
                    "Female", LocalDate.of(1988, 9, 18), "USA",
                    false, null, null, null, null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Contractual Medical Staff
            createEmployeeWithPermissions(
                    "william.contract@demohealthcare.com", demoPassword, "EMP-021",
                    "William", "Thomas", "william.thomas@personal.com", "+1-555-3006",
                    "contractual", "active", LocalDate.of(2024, 1, 1),
                    deptMedical2, posNurse2, orgAdmin2, null, null, null, null, null,
                    "Contract Nurse", new BigDecimal("70000"), "USD",
                    "Male", LocalDate.of(1990, 7, 22), "USA",
                    false, null, null, null, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Junior Medical Staff on Probation
            createEmployeeWithPermissions(
                    "barbara.probation@demohealthcare.com", demoPassword, "EMP-022",
                    "Barbara", "Taylor", "barbara.taylor@personal.com", "+1-555-3007",
                    "internal", "active", LocalDate.of(2024, 8, 1),
                    deptMedical2, posNurse2, orgAdmin2, null, null, null, null, null,
                    "Junior Nurse", new BigDecimal("55000"), "USD",
                    "Female", LocalDate.of(1997, 2, 14), "USA",
                    true, LocalDate.of(2024, 8, 1), LocalDate.of(2025, 2, 1), "active", null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Medical Intern
            createEmployeeWithPermissions(
                    "daniel.intern@demohealthcare.com", demoPassword, "EMP-023",
                    "Daniel", "Martinez", "daniel.martinez@personal.com", "+1-555-3008",
                    "internal", "active", LocalDate.of(2024, 6, 1),
                    deptMedical2, posNurse2, orgAdmin2, null, null, null, null, null,
                    "Medical Intern", new BigDecimal("42000"), "USD",
                    "Male", LocalDate.of(2000, 10, 5), "USA",
                    true, LocalDate.of(2024, 6, 1), LocalDate.of(2024, 12, 1), "active", null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // IT Intern
            createEmployeeWithPermissions(
                    "jessica.intern@demohealthcare.com", demoPassword, "EMP-024",
                    "Jessica", "Garcia", "jessica.garcia@personal.com", "+1-555-3009",
                    "internal", "active", LocalDate.of(2024, 6, 15),
                    deptIT2, posIT2, orgAdmin2, null, null, null, null, null,
                    "IT Intern", new BigDecimal("40000"), "USD",
                    "Female", LocalDate.of(2001, 12, 20), "USA",
                    true, LocalDate.of(2024, 6, 15), LocalDate.of(2024, 12, 15), "active", null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Administrative Staff
            createEmployeeWithPermissions(
                    "charles.admin@demohealthcare.com", demoPassword, "EMP-025",
                    "Charles", "Rodriguez", "charles.rodriguez@personal.com", "+1-555-3010",
                    "internal", "active", LocalDate.of(2023, 4, 1),
                    deptHR2, posIT2, orgAdmin2, null, null, null, null, null,
                    "Administrative Assistant", new BigDecimal("48000"), "USD",
                    "Male", LocalDate.of(1995, 6, 8), "USA",
                    false, null, null, null, null, null,
                    org2, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // ========== ORG3: DEMO FINANCIAL SERVICES (5 employees) ==========

            // Senior Financial Analyst 1
            createEmployeeWithPermissions(
                    "michael.analyst@demofinance.com", demoPassword, "EMP-026",
                    "Michael", "Brown", "michael.brown@personal.com", "+1-555-4001",
                    "internal", "active", LocalDate.of(2022, 2, 15),
                    deptFinance3, posSeniorAnalyst3, orgAdmin3, null, null, null, null, null,
                    "Senior Financial Analyst", new BigDecimal("95000"), "USD",
                    "Male", LocalDate.of(1986, 3, 18), "USA",
                    false, null, null, null, null, null,
                    org3, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Financial Analyst
            createEmployeeWithPermissions(
                    "sarah.analyst@demofinance.com", demoPassword, "EMP-027",
                    "Sarah", "Davis", "sarah.davis@personal.com", "+1-555-4002",
                    "internal", "active", LocalDate.of(2023, 7, 1),
                    deptFinance3, posAnalyst3, orgAdmin3, null, null, null, null, null,
                    "Financial Analyst", new BigDecimal("72000"), "USD",
                    "Female", LocalDate.of(1991, 8, 25), "USA",
                    false, null, null, null, null, null,
                    org3, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Compliance Officer
            createEmployeeWithPermissions(
                    "joseph.compliance@demofinance.com", demoPassword, "EMP-028",
                    "Joseph", "Wilson", "joseph.wilson@personal.com", "+1-555-4003",
                    "internal", "active", LocalDate.of(2022, 11, 10),
                    deptCompliance3, posSeniorAnalyst3, orgAdmin3, null, null, null, null, null,
                    "Compliance Officer", new BigDecimal("88000"), "USD",
                    "Male", LocalDate.of(1984, 5, 30), "USA",
                    false, null, null, null, null, null,
                    org3, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Junior Financial Analyst on Probation
            createEmployeeWithPermissions(
                    "ashley.junior@demofinance.com", demoPassword, "EMP-029",
                    "Ashley", "Moore", "ashley.moore@personal.com", "+1-555-4004",
                    "internal", "active", LocalDate.of(2024, 9, 1),
                    deptFinance3, posAnalyst3, orgAdmin3, null, null, null, null, null,
                    "Junior Financial Analyst", new BigDecimal("58000"), "USD",
                    "Female", LocalDate.of(1998, 11, 12), "USA",
                    true, LocalDate.of(2024, 9, 1), LocalDate.of(2025, 3, 1), "active", null, null,
                    org3, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            // Contract Financial Advisor
            createEmployeeWithPermissions(
                    "matthew.contract@demofinance.com", demoPassword, "EMP-030",
                    "Matthew", "Taylor", "matthew.taylor@personal.com", "+1-555-4005",
                    "contractual", "active", LocalDate.of(2024, 2, 1),
                    deptFinance3, posAnalyst3, orgAdmin3, null, null, null, null, null,
                    "Contract Financial Advisor", new BigDecimal("85000"), "USD",
                    "Male", LocalDate.of(1989, 4, 8), "USA",
                    false, null, null, null, LocalDate.of(2024, 2, 1), LocalDate.of(2025, 1, 31),
                    org3, employeeRole, Collections.singleton(employeeBasicGroup),
                    userRepository, employeeRepository
            );

            logger.info("======================================");
            logger.info("Demo data loaded successfully!");
            logger.info("======================================");
            logger.info("Organizations: 10 (with org admins)");
            logger.info("Total Employees: 30 across 3 organizations");
            logger.info("  - Demo Tech Solutions Inc: 15 employees");
            logger.info("  - Demo Healthcare Systems: 10 employees");
            logger.info("  - Demo Financial Services: 5 employees");
            logger.info("Employee Types: Internal, Contractual, Vendor, Client, Sub-Vendor, Intern, Probation");
            logger.info("Clients: 3");
            logger.info("Vendors: 2");
            logger.info("Projects: 3");
            logger.info("Employees with document request permissions: 3");
            logger.info("======================================");
            logger.info("Login Credentials (All passwords: 12345):");
            logger.info("Super Admin (if exists): Your existing credentials");
            logger.info("");
            logger.info("Org Admins:");
            logger.info("  admin1@tech.com          - Demo Tech Solutions Inc");
            logger.info("  admin2@heal.com          - Demo Healthcare Systems");
            logger.info("  admin3@fina.com          - Demo Financial Services");
            logger.info("  admin4@reta.com          - Demo Retail Corp");
            logger.info("  admin5@manu.com          - Demo Manufacturing Ltd");
            logger.info("  admin6@cons.com          - Demo Consulting Group");
            logger.info("  admin7@educ.com          - Demo Education Platform");
            logger.info("  admin8@logi.com          - Demo Logistics Pro");
            logger.info("  admin9@medi.com          - Demo Media & Entertainment");
            logger.info("  admin10@star.com         - Demo Startup Hub");
            logger.info("");
            logger.info("Sample Employees:");
            logger.info("  bob.manager@demotech.com      - Engineering Manager (can request documents)");
            logger.info("  sarah.lead@demotech.com       - Team Lead (can request documents)");
            logger.info("  rachel.hr@demotech.com        - HR Manager (can request documents)");
            logger.info("  john.senior@demotech.com      - Senior Software Engineer");
            logger.info("  mike.junior@demotech.com      - Junior Dev (Probation)");
            logger.info("  emma.intern@demotech.com      - Intern (Probation)");
            logger.info("  susan.contract@demotech.com   - Contractual Employee");
            logger.info("  alice.vendor@demotech.com     - Vendor Employee");
            logger.info("  dr.james@demohealthcare.com   - Medical Director");
            logger.info("  michael.analyst@demofinance.com - Senior Financial Analyst");
            logger.info("======================================");
        };
    }

    // Helper methods
    private Department createDepartment(String name, Organization org, DepartmentRepository repo) {
        Department dept = new Department();
        dept.setName(name);
        dept.setOrganization(org);
        return repo.save(dept);
    }

    private Position createPosition(String title, String level, Organization org, PositionRepository repo) {
        Position pos = new Position();
        pos.setName(title);
        Integer seniorityLevel = convertLevelToSeniority(level);
        pos.setSeniorityLevel(seniorityLevel);
        pos.setOrganization(org);
        return repo.save(pos);
    }

    private Integer convertLevelToSeniority(String level) {
        // Convert level strings to numeric seniority (higher = more senior)
        return switch (level.toLowerCase()) {
            case "junior" -> 1;
            case "mid" -> 2;
            case "senior" -> 3;
            case "manager" -> 4;
            case "director" -> 5;
            case "executive" -> 6;
            default -> 2; // default to mid-level
        };
    }

    private Client createClient(String name, String code, String contactPerson, String email, String phone, Organization org, ClientRepository repo) {
        Client client = new Client();
        client.setName(name);
        client.setClientCode(code);
        client.setPrimaryContactName(contactPerson);
        client.setPrimaryContactEmail(email);
        client.setPrimaryContactPhone(phone);
        client.setClientType("corporate"); // Set required field
        client.setOrganization(org);
        return repo.save(client);
    }

    private Vendor createVendor(String name, String code, String contactPerson, String email, String phone, Organization org, VendorRepository repo) {
        Vendor vendor = new Vendor();
        vendor.setName(name);
        vendor.setVendorCode(code);
        vendor.setPrimaryContactName(contactPerson);
        vendor.setPrimaryContactEmail(email);
        vendor.setPrimaryContactPhone(phone);
        vendor.setVendorType("staffing"); // Set required field
        vendor.setBillingType("hourly"); // Set required field
        vendor.setOrganization(org);
        return repo.save(vendor);
    }

    private Project createProject(String name, String code, String description, LocalDate startDate, String status, Client client, Organization org, ProjectRepository repo) {
        Project project = new Project();
        project.setProjectName(name);
        project.setProjectCode(code);
        project.setDescription(description);
        project.setStartDate(startDate);
        project.setProjectStatus(status);
        project.setClient(client);
        project.setOrganization(org);
        return repo.save(project);
    }

    private Employee createEmployeeWithPermissions(
            String email, String password, String empCode,
            String firstName, String lastName, String personalEmail, String phone,
            String empType, String empStatus, LocalDate joiningDate,
            Department dept, Position position, Employee reportsTo,
            Vendor vendor, Client client, String clientName, Project project, String projectId,
            String designation, BigDecimal salary, String currency,
            String gender, LocalDate dob, String nationality,
            Boolean isProbation, LocalDate probStart, LocalDate probEnd, String probStatus,
            LocalDate contractStart, LocalDate contractEnd,
            Organization org, Role role, Set<PermissionGroup> permissionGroups,
            UserRepository userRepo, EmployeeRepository empRepo) {

        // Create user
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setEnabled(true);
        user.setOrganization(org);
        user.getRoles().add(role);
        userRepo.save(user);

        // Create employee
        Employee emp = new Employee();
        emp.setUser(user);
        emp.setOrganization(org);
        emp.setEmployeeCode(empCode);
        emp.setFirstName(firstName);
        emp.setLastName(lastName);
        emp.setPersonalEmail(personalEmail);
        emp.setPhoneNumber(phone);
        emp.setEmploymentType(empType);
        emp.setEmploymentStatus(empStatus);
        emp.setJoiningDate(joiningDate);
        emp.setDepartment(dept);
        emp.setPosition(position);
        emp.setReportsTo(reportsTo);
        emp.setVendor(vendor);
        emp.setClient(client);
        emp.setClientName(clientName);
        emp.setProject(project);
        emp.setProjectId(projectId);
        emp.setDesignation(designation);
        emp.setBasicSalary(salary);
        emp.setSalaryCurrency(currency);
        emp.setGender(gender);
        emp.setDateOfBirth(dob);
        emp.setNationality(nationality);
        emp.setIsProbation(isProbation);
        emp.setProbationStartDate(probStart);
        emp.setProbationEndDate(probEnd);
        emp.setProbationStatus(probStatus);
        emp.setContractStartDate(contractStart);
        emp.setContractEndDate(contractEnd);

        // Assign permission groups
        if (permissionGroups != null && !permissionGroups.isEmpty()) {
            emp.setPermissionGroups(permissionGroups);
        }

        empRepo.save(emp);
        logger.info("Created employee: {} {} ({}) with {} permission group(s)",
                   firstName, lastName, empCode, permissionGroups != null ? permissionGroups.size() : 0);
        return emp;
    }
}

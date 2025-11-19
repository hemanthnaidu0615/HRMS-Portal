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
import java.util.Arrays;
import java.util.List;

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

            String demoPassword = passwordEncoder.encode("Demo@123456");

            // Get system roles
            Role orgAdminRole = roleRepository.findByNameAndOrganizationIsNull("ORGADMIN")
                    .orElseThrow(() -> new RuntimeException("ORGADMIN role not found"));
            Role employeeRole = roleRepository.findByNameAndOrganizationIsNull("EMPLOYEE")
                    .orElseThrow(() -> new RuntimeException("EMPLOYEE role not found"));

            // ===== CREATE 10 ORGANIZATIONS =====
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

            for (String orgName : orgNames) {
                Organization org = new Organization(orgName);
                organizationRepository.save(org);
                logger.info("Created organization: {}", orgName);
            }

            // Work with first organization for detailed demo data
            Organization org1 = organizationRepository.findAll().stream()
                    .filter(org -> org.getName().equals("Demo Tech Solutions Inc"))
                    .findFirst()
                    .orElseThrow();

            // ===== CREATE DEPARTMENTS =====
            Department deptIT = createDepartment("Information Technology", "Software development and IT operations", org1, departmentRepository);
            Department deptHR = createDepartment("Human Resources", "HR management and recruitment", org1, departmentRepository);
            Department deptFin = createDepartment("Finance", "Financial planning and accounting", org1, departmentRepository);
            Department deptSales = createDepartment("Sales & Marketing", "Sales and customer relations", org1, departmentRepository);
            Department deptOps = createDepartment("Operations", "Business operations and support", org1, departmentRepository);

            // ===== CREATE POSITIONS =====
            Position posManager = createPosition("Engineering Manager", "Team lead and technical manager", "Manager", deptIT, org1, positionRepository);
            Position posSeniorDev = createPosition("Senior Software Engineer", "Senior development role", "Senior", deptIT, org1, positionRepository);
            Position posDev = createPosition("Software Engineer", "Mid-level developer", "Mid", deptIT, org1, positionRepository);
            Position posJuniorDev = createPosition("Junior Software Engineer", "Entry-level developer", "Junior", deptIT, org1, positionRepository);
            Position posHRManager = createPosition("HR Manager", "Human resources manager", "Manager", deptHR, org1, positionRepository);
            Position posHRExecutive = createPosition("HR Executive", "HR operations", "Executive", deptHR, org1, positionRepository);

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

            // ===== CREATE ORG ADMIN =====
            Employee orgAdmin = createEmployee(
                    "admin@demo-tech.com", demoPassword, "DEMO-ADM001",
                    "Alice", "Anderson", "alice.anderson@demo.hrms.com", "+1-555-1001",
                    "internal", "active", LocalDate.of(2023, 1, 15),
                    deptIT, posManager, null, null, null, null, null, null,
                    "Director of Engineering", new BigDecimal("95000"), "USD",
                    "Female", LocalDate.of(1985, 3, 10), "USA",
                    false, null, null, null, null, null,
                    org1, orgAdminRole, userRepository, employeeRepository
            );

            // ===== INTERNAL EMPLOYEES (10) =====
            Employee emp1 = createEmployee(
                    "bob.builder@demo-tech.com", demoPassword, "DEMO-IT001",
                    "Bob", "Builder", "bob.builder@personal.com", "+1-555-1101",
                    "internal", "active", LocalDate.of(2023, 6, 1),
                    deptIT, posSeniorDev, orgAdmin, null, null, null, null, null,
                    "Senior Software Engineer", new BigDecimal("85000"), "USD",
                    "Male", LocalDate.of(1990, 5, 15), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            Employee emp2 = createEmployee(
                    "carol.clark@demo-tech.com", demoPassword, "DEMO-IT002",
                    "Carol", "Clark", "carol.clark@personal.com", "+1-555-1102",
                    "internal", "active", LocalDate.of(2023, 7, 1),
                    deptIT, posDev, emp1, null, null, null, null, null,
                    "Software Engineer", new BigDecimal("70000"), "USD",
                    "Female", LocalDate.of(1992, 8, 20), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            Employee emp3 = createEmployee(
                    "david.davis@demo-tech.com", demoPassword, "DEMO-IT003",
                    "David", "Davis", "david.davis@personal.com", "+1-555-1103",
                    "internal", "active", LocalDate.of(2024, 10, 1),
                    deptIT, posJuniorDev, emp2, null, null, null, null, null,
                    "Junior Software Engineer", new BigDecimal("55000"), "USD",
                    "Male", LocalDate.of(1998, 3, 10), "USA",
                    true, LocalDate.of(2024, 10, 1), LocalDate.of(2025, 4, 1), "active", null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            Employee emp4 = createEmployee(
                    "emma.evans@demo-tech.com", demoPassword, "DEMO-HR001",
                    "Emma", "Evans", "emma.evans@personal.com", "+1-555-1201",
                    "internal", "active", LocalDate.of(2023, 2, 15),
                    deptHR, posHRManager, orgAdmin, null, null, null, null, null,
                    "HR Manager", new BigDecimal("75000"), "USD",
                    "Female", LocalDate.of(1988, 11, 25), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            Employee emp5 = createEmployee(
                    "frank.foster@demo-tech.com", demoPassword, "DEMO-HR002",
                    "Frank", "Foster", "frank.foster@personal.com", "+1-555-1202",
                    "internal", "active", LocalDate.of(2024, 1, 10),
                    deptHR, posHRExecutive, emp4, null, null, null, null, null,
                    "HR Executive", new BigDecimal("50000"), "USD",
                    "Male", LocalDate.of(1995, 7, 18), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            // ===== CONTRACTUAL EMPLOYEES (5) =====
            createEmployee(
                    "grace.green@demo-tech.com", demoPassword, "DEMO-CT001",
                    "Grace", "Green", "grace.green@personal.com", "+1-555-2001",
                    "contractual", "active", LocalDate.of(2024, 1, 1),
                    deptIT, posDev, emp1, null, null, null, null, null,
                    "Contract Software Engineer", new BigDecimal("75000"), "USD",
                    "Female", LocalDate.of(1993, 4, 12), "USA",
                    false, null, null, null, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    org1, employeeRole, userRepository, employeeRepository
            );

            createEmployee(
                    "henry.harris@demo-tech.com", demoPassword, "DEMO-CT002",
                    "Henry", "Harris", "henry.harris@personal.com", "+1-555-2002",
                    "contractual", "active", LocalDate.of(2024, 3, 1),
                    deptIT, posDev, emp1, null, null, null, null, null,
                    "Contract QA Engineer", new BigDecimal("65000"), "USD",
                    "Male", LocalDate.of(1991, 9, 30), "USA",
                    false, null, null, null, LocalDate.of(2024, 3, 1), LocalDate.of(2025, 2, 28),
                    org1, employeeRole, userRepository, employeeRepository
            );

            // ===== VENDOR EMPLOYEES (5) =====
            createEmployee(
                    "irene.ingram@demo-tech.com", demoPassword, "DEMO-VN001",
                    "Irene", "Ingram", "irene.ingram@demostaffing.com", "+1-555-3001",
                    "vendor", "active", LocalDate.of(2024, 2, 1),
                    deptIT, posDev, emp1, vendor1, null, null, null, null,
                    "Vendor Developer", new BigDecimal("70000"), "USD",
                    "Female", LocalDate.of(1994, 2, 14), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            createEmployee(
                    "jack.jackson@demo-tech.com", demoPassword, "DEMO-VN002",
                    "Jack", "Jackson", "jack.jackson@demotechcon.com", "+1-555-3002",
                    "vendor", "active", LocalDate.of(2024, 4, 1),
                    deptIT, posDev, emp1, vendor2, null, null, null, null,
                    "Vendor DevOps Engineer", new BigDecimal("72000"), "USD",
                    "Male", LocalDate.of(1992, 6, 22), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            // ===== CLIENT PROJECT EMPLOYEES (5) =====
            createEmployee(
                    "kate.king@demo-tech.com", demoPassword, "DEMO-CL001",
                    "Kate", "King", "kate.king@democlient.com", "+1-555-4001",
                    "client", "active", LocalDate.of(2024, 1, 15),
                    deptIT, posSeniorDev, emp1, null, client1, null, project1, "PRJ001",
                    "Client Project Lead", new BigDecimal("90000"), "USD",
                    "Female", LocalDate.of(1989, 12, 5), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            createEmployee(
                    "leo.lewis@demo-tech.com", demoPassword, "DEMO-CL002",
                    "Leo", "Lewis", "leo.lewis@demointl.com", "+1-555-4002",
                    "client", "active", LocalDate.of(2024, 2, 20),
                    deptIT, posDev, emp1, null, client2, null, project2, "PRJ002",
                    "Client Developer", new BigDecimal("75000"), "USD",
                    "Male", LocalDate.of(1993, 1, 28), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            // ===== SUB-VENDOR EMPLOYEES (3) =====
            createEmployee(
                    "maria.miller@demo-tech.com", demoPassword, "DEMO-SV001",
                    "Maria", "Miller", "maria.miller@subvendor.com", "+1-555-5001",
                    "sub_vendor", "active", LocalDate.of(2024, 5, 1),
                    deptIT, posJuniorDev, emp2, vendor1, null, null, null, null,
                    "Sub-Vendor Junior Dev", new BigDecimal("55000"), "USD",
                    "Female", LocalDate.of(1996, 8, 15), "USA",
                    false, null, null, null, null, null,
                    org1, employeeRole, userRepository, employeeRepository
            );

            logger.info("======================================");
            logger.info("Demo data loaded successfully!");
            logger.info("======================================");
            logger.info("Organizations: 10");
            logger.info("Employees: 12 (varied types)");
            logger.info("Clients: 3");
            logger.info("Vendors: 2");
            logger.info("Projects: 3");
            logger.info("======================================");
            logger.info("Login Credentials:");
            logger.info("OrgAdmin: admin@demo-tech.com / Demo@123456");
            logger.info("Employee: bob.builder@demo-tech.com / Demo@123456");
            logger.info("======================================");
        };
    }

    // Helper methods
    private Department createDepartment(String name, String description, Organization org, DepartmentRepository repo) {
        Department dept = new Department();
        dept.setName(name);
        dept.setDescription(description);
        dept.setOrganization(org);
        return repo.save(dept);
    }

    private Position createPosition(String title, String description, String level, Department dept, Organization org, PositionRepository repo) {
        Position pos = new Position();
        pos.setTitle(title);
        pos.setDescription(description);
        pos.setLevel(level);
        pos.setDepartment(dept);
        pos.setOrganization(org);
        return repo.save(pos);
    }

    private Client createClient(String name, String code, String contactPerson, String email, String phone, Organization org, ClientRepository repo) {
        Client client = new Client();
        client.setName(name);
        client.setCode(code);
        client.setContactPerson(contactPerson);
        client.setEmail(email);
        client.setPhone(phone);
        client.setOrganization(org);
        return repo.save(client);
    }

    private Vendor createVendor(String name, String code, String contactPerson, String email, String phone, Organization org, VendorRepository repo) {
        Vendor vendor = new Vendor();
        vendor.setName(name);
        vendor.setCode(code);
        vendor.setContactPerson(contactPerson);
        vendor.setEmail(email);
        vendor.setPhone(phone);
        vendor.setOrganization(org);
        return repo.save(vendor);
    }

    private Project createProject(String name, String code, String description, LocalDate startDate, String status, Client client, Organization org, ProjectRepository repo) {
        Project project = new Project();
        project.setName(name);
        project.setCode(code);
        project.setDescription(description);
        project.setStartDate(startDate);
        project.setStatus(status);
        project.setClient(client);
        project.setOrganization(org);
        return repo.save(project);
    }

    private Employee createEmployee(
            String email, String password, String empCode,
            String firstName, String lastName, String personalEmail, String phone,
            String empType, String empStatus, LocalDate joiningDate,
            Department dept, Position position, Employee reportsTo,
            Vendor vendor, Client client, String clientName, Project project, String projectId,
            String designation, BigDecimal salary, String currency,
            String gender, LocalDate dob, String nationality,
            Boolean isProbation, LocalDate probStart, LocalDate probEnd, String probStatus,
            LocalDate contractStart, LocalDate contractEnd,
            Organization org, Role role, UserRepository userRepo, EmployeeRepository empRepo) {

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

        empRepo.save(emp);
        logger.info("Created employee: {} {} ({})", firstName, lastName, empCode);
        return emp;
    }
}

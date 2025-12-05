package com.hrms.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrms.dto.*;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class FullOnboardingFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.hrms.service.UserService userService;

    @Autowired
    private com.hrms.repository.OrganizationRepository organizationRepository;

    @Autowired
    private com.hrms.repository.RoleRepository roleRepository;

    private static String jwtToken;
    private static UUID departmentId;
    private static UUID positionId;
    private static UUID employeeId;

    @org.junit.jupiter.api.BeforeEach
    public void setup() {
        // Ensure 'orgadmin' system role exists (required by UserService.createOrgAdmin)
        if (roleRepository.findByName("orgadmin").isEmpty()) {
            com.hrms.entity.Role role = new com.hrms.entity.Role();
            role.setName("orgadmin");
            role.setSystemRole(true);
            roleRepository.save(role);
        }

        // Ensure test admin exists
        if (userService.findByEmail("testadmin@example.com").isEmpty()) {
            // Create Org if needed
            com.hrms.entity.Organization org = organizationRepository.findByName("Test Org")
                .orElseGet(() -> {
                    com.hrms.entity.Organization newOrg = new com.hrms.entity.Organization();
                    newOrg.setName("Test Org");
                    newOrg.setCountry("USA");
                    return organizationRepository.save(newOrg);
                });

            // Create Org Admin
            userService.createOrgAdmin("testadmin@example.com", "password123", org);
        }
    }

    @Test
    @Order(1)
    public void testLoginAndGetToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("testadmin@example.com");
        loginRequest.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        LoginResponse authResponse = objectMapper.readValue(response, LoginResponse.class);
        jwtToken = authResponse.getToken();
        System.out.println("Got Token: " + jwtToken);
    }

    @Test
    @Order(2)
    public void testCreateDepartment() throws Exception {
        DepartmentRequest dept = new DepartmentRequest();
        dept.setName("Engineering");
        // Note: DepartmentRequest only has 'name' based on view_file, code/desc might be missing or auto-generated

        MvcResult result = mockMvc.perform(post("/api/orgadmin/structure/departments")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dept)))
                .andExpect(status().isOk())
                .andReturn();
        
        DepartmentResponse created = objectMapper.readValue(result.getResponse().getContentAsString(), DepartmentResponse.class);
        departmentId = created.getId();
    }

    @Test
    @Order(3)
    public void testCreatePosition() throws Exception {
        PositionRequest pos = new PositionRequest();
        pos.setName("Senior Developer");
        pos.setSeniorityLevel(3);
        
        MvcResult result = mockMvc.perform(post("/api/orgadmin/structure/positions")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pos)))
                .andExpect(status().isOk())
                .andReturn();

        PositionResponse created = objectMapper.readValue(result.getResponse().getContentAsString(), PositionResponse.class);
        positionId = created.getId();
    }

    @Test
    @Order(4)
    public void testCreateEmployeeFull() throws Exception {
        CreateEmployeeRequest req = new CreateEmployeeRequest();
        
        // Basic
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setEmail("john.doe.test@example.com");
        req.setEmployeeCode("EMP-TEST-001");
        req.setJoiningDate(LocalDate.now());
        req.setEmploymentType("full_time");
        
        // Org Structure
        req.setDepartmentId(departmentId);
        req.setPositionId(positionId);
        
        // Personal
        req.setMiddleName("Quincy");
        req.setDateOfBirth(LocalDate.of(1990, 1, 1));
        req.setGender("male");
        req.setNationality("American");
        req.setMaritalStatus("single");
        
        // Contact
        req.setPersonalEmail("john.personal@example.com");
        req.setPhoneNumber("555-0100");
        
        // Address
        req.setCurrentAddressLine1("123 Tech Lane");
        req.setCurrentCity("San Francisco");
        req.setCurrentState("CA");
        req.setCurrentCountry("USA");
        req.setCurrentPostalCode("94105");
        
        // Bank
        req.setBankAccountNumber("1234567890");
        req.setBankName("Tech Bank");
        req.setIfscCode("TB001");
        
        // Identity
        req.setSsnNumber("123-45-6789");
        req.setPassportNumber("A12345678");

        MvcResult result = mockMvc.perform(post("/api/orgadmin/employees")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        
        EmployeeDetailResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeDetailResponse.class);
        employeeId = response.getEmployeeId();
    }

    @Test
    @Order(5)
    public void testGetEmployeeDetails() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/orgadmin/employees/" + employeeId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeDetailResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeDetailResponse.class);
        
        // Verify Deep Fields
        if (!"John".equals(response.getFirstName())) throw new RuntimeException("First Name Mismatch");
        if (!"123 Tech Lane".equals(response.getCurrentAddressLine1())) throw new RuntimeException("Address Mismatch");
        if (!"Tech Bank".equals(response.getBankName())) throw new RuntimeException("Bank Name Mismatch");
        if (!"123-45-6789".equals(response.getSsnNumber())) throw new RuntimeException("SSN Mismatch");
    }
}

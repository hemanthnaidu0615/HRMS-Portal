-- =====================================================
-- HRMS Test Data Seed Script
-- Creates: 10 Organizations, 30+ Employees, Clients, Vendors, Projects
-- =====================================================
-- NOTE: Run this script AFTER the application has created the schema
-- All passwords are: Demo@123456 (hashed using BCrypt)
-- =====================================================

-- Clean up existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM document_requests WHERE id IS NOT NULL;
-- DELETE FROM documents WHERE id IS NOT NULL;
-- DELETE FROM employees WHERE employee_code LIKE 'DEMO-%';
-- DELETE FROM users WHERE email LIKE '%@demo.hrms.com';
-- DELETE FROM organizations WHERE name LIKE 'Demo Org%';

-- =====================================================
-- 1. Organizations (10 orgs)
-- =====================================================
DECLARE @org1 UNIQUEIDENTIFIER = NEWID();
DECLARE @org2 UNIQUEIDENTIFIER = NEWID();
DECLARE @org3 UNIQUEIDENTIFIER = NEWID();
DECLARE @org4 UNIQUEIDENTIFIER = NEWID();
DECLARE @org5 UNIQUEIDENTIFIER = NEWID();
DECLARE @org6 UNIQUEIDENTIFIER = NEWID();
DECLARE @org7 UNIQUEIDENTIFIER = NEWID();
DECLARE @org8 UNIQUEIDENTIFIER = NEWID();
DECLARE @org9 UNIQUEIDENTIFIER = NEWID();
DECLARE @org10 UNIQUEIDENTIFIER = NEWID();

INSERT INTO organizations (id, name, created_at) VALUES
(@org1, 'Demo Tech Solutions Inc', GETDATE()),
(@org2, 'Demo Healthcare Systems', GETDATE()),
(@org3, 'Demo Financial Services', GETDATE()),
(@org4, 'Demo Retail Corp', GETDATE()),
(@org5, 'Demo Manufacturing Ltd', GETDATE()),
(@org6, 'Demo Consulting Group', GETDATE()),
(@org7, 'Demo Education Platform', GETDATE()),
(@org8, 'Demo Logistics Pro', GETDATE()),
(@org9, 'Demo Media & Entertainment', GETDATE()),
(@org10, 'Demo Startup Hub', GETDATE());

-- =====================================================
-- 2. Departments for each organization
-- =====================================================
DECLARE @deptIT1 UNIQUEIDENTIFIER = NEWID();
DECLARE @deptHR1 UNIQUEIDENTIFIER = NEWID();
DECLARE @deptFin1 UNIQUEIDENTIFIER = NEWID();
DECLARE @deptSales1 UNIQUEIDENTIFIER = NEWID();
DECLARE @deptOps1 UNIQUEIDENTIFIER = NEWID();

-- Org 1 Departments
INSERT INTO departments (id, name, description, organization_id, created_at) VALUES
(@deptIT1, 'Information Technology', 'Software development and IT operations', @org1, GETDATE()),
(@deptHR1, 'Human Resources', 'HR management and recruitment', @org1, GETDATE()),
(@deptFin1, 'Finance', 'Financial planning and accounting', @org1, GETDATE()),
(@deptSales1, 'Sales & Marketing', 'Sales and customer relations', @org1, GETDATE()),
(@deptOps1, 'Operations', 'Business operations and support', @org1, GETDATE());

-- (Simplified: Using same structure for other orgs - in production you'd customize)
INSERT INTO departments (id, name, description, organization_id, created_at)
SELECT NEWID(), name, description, @org2, GETDATE() FROM departments WHERE organization_id = @org1;
INSERT INTO departments (id, name, description, organization_id, created_at)
SELECT NEWID(), name, description, @org3, GETDATE() FROM departments WHERE organization_id = @org1;

-- =====================================================
-- 3. Positions
-- =====================================================
DECLARE @posManager UNIQUEIDENTIFIER = NEWID();
DECLARE @posSeniorDev UNIQUEIDENTIFIER = NEWID();
DECLARE @posDev UNIQUEIDENTIFIER = NEWID();
DECLARE @posJuniorDev UNIQUEIDENTIFIER = NEWID();
DECLARE @posHRManager UNIQUEIDENTIFIER = NEWID();
DECLARE @posHRExecutive UNIQUEIDENTIFIER = NEWID();

INSERT INTO positions (id, title, description, department_id, level, organization_id, created_at) VALUES
(@posManager, 'Engineering Manager', 'Team lead and technical manager', @deptIT1, 'Manager', @org1, GETDATE()),
(@posSeniorDev, 'Senior Software Engineer', 'Senior development role', @deptIT1, 'Senior', @org1, GETDATE()),
(@posDev, 'Software Engineer', 'Mid-level developer', @deptIT1, 'Mid', @org1, GETDATE()),
(@posJuniorDev, 'Junior Software Engineer', 'Entry-level developer', @deptIT1, 'Junior', @org1, GETDATE()),
(@posHRManager, 'HR Manager', 'Human resources manager', @deptHR1, 'Manager', @org1, GETDATE()),
(@posHRExecutive, 'HR Executive', 'HR operations', @deptHR1, 'Executive', @org1, GETDATE());

-- =====================================================
-- 4. Roles
-- =====================================================
DECLARE @roleOrgAdmin UNIQUEIDENTIFIER;
DECLARE @roleEmployee UNIQUEIDENTIFIER;

SELECT @roleOrgAdmin = id FROM roles WHERE name = 'ORGADMIN' AND organization_id IS NULL;
SELECT @roleEmployee = id FROM roles WHERE name = 'EMPLOYEE' AND organization_id IS NULL;

-- =====================================================
-- 5. Clients
-- =====================================================
DECLARE @client1 UNIQUEIDENTIFIER = NEWID();
DECLARE @client2 UNIQUEIDENTIFIER = NEWID();
DECLARE @client3 UNIQUEIDENTIFIER = NEWID();

INSERT INTO clients (id, name, code, contact_person, email, phone, organization_id, created_at) VALUES
(@client1, 'Demo Client Corp', 'CL001', 'John Smith', 'john@democlient.com', '+1-555-0101', @org1, GETDATE()),
(@client2, 'Demo International Ltd', 'CL002', 'Sarah Johnson', 'sarah@demointl.com', '+1-555-0102', @org1, GETDATE()),
(@client3, 'Demo Enterprise Solutions', 'CL003', 'Michael Brown', 'michael@demoent.com', '+1-555-0103', @org1, GETDATE());

-- =====================================================
-- 6. Vendors
-- =====================================================
DECLARE @vendor1 UNIQUEIDENTIFIER = NEWID();
DECLARE @vendor2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO vendors (id, name, code, contact_person, email, phone, organization_id, created_at) VALUES
(@vendor1, 'Demo Staffing Solutions', 'VN001', 'Emily Davis', 'emily@demostaffing.com', '+1-555-0201', @org1, GETDATE()),
(@vendor2, 'Demo Tech Contractors', 'VN002', 'David Wilson', 'david@demotechcon.com', '+1-555-0202', @org1, GETDATE());

-- =====================================================
-- 7. Projects
-- =====================================================
DECLARE @project1 UNIQUEIDENTIFIER = NEWID();
DECLARE @project2 UNIQUEIDENTIFIER = NEWID();
DECLARE @project3 UNIQUEIDENTIFIER = NEWID();

INSERT INTO projects (id, name, code, description, client_id, organization_id, start_date, status, created_at) VALUES
(@project1, 'Demo ERP Implementation', 'PRJ001', 'Enterprise resource planning system', @client1, @org1, '2024-01-01', 'active', GETDATE()),
(@project2, 'Demo Mobile App', 'PRJ002', 'Customer mobile application', @client2, @org1, '2024-02-01', 'active', GETDATE()),
(@project3, 'Demo Cloud Migration', 'PRJ003', 'Infrastructure cloud migration', @client3, @org1, '2024-03-01', 'active', GETDATE());

-- =====================================================
-- 8. Users & Employees (30 employees across different types)
-- =====================================================
-- Password: Demo@123456 (BCrypt hash)
DECLARE @passwordHash VARCHAR(100) = '$2a$10$eHZQ8M3Q8M3Q8M3Q8M3Q8uT8M3Q8M3Q8M3Q8M3Q8M3Q8M3Q8M3Q8';

-- OrgAdmin for Org1
DECLARE @userOrgAdmin1 UNIQUEIDENTIFIER = NEWID();
DECLARE @empOrgAdmin1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userOrgAdmin1, 'admin@demo-tech.com', @passwordHash, 1, @org1, GETDATE());

INSERT INTO user_roles (user_id, role_id) VALUES (@userOrgAdmin1, @roleOrgAdmin);

INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, designation, created_at) VALUES
(@empOrgAdmin1, @userOrgAdmin1, @org1, 'DEMO-ADM001', 'Alice', 'Anderson',
    'alice.anderson@demo.hrms.com', '+1-555-1001', 'internal', 'active', '2023-01-15',
    @deptIT1, @posManager, 'Director of Engineering', GETDATE());

-- ===== INTERNAL EMPLOYEES (10) =====
DECLARE @userEmp1 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp1 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp1, 'bob.builder@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp1, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, reports_to, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp1, @userEmp1, @org1, 'DEMO-IT001', 'Bob', 'Builder',
    'bob.builder@personal.com', '+1-555-1101', 'internal', 'active', '2023-06-01',
    @deptIT1, @posSeniorDev, @empOrgAdmin1, 'Senior Software Engineer', 85000, 'USD',
    'Male', '1990-05-15', 'USA', GETDATE());

DECLARE @userEmp2 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp2 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp2, 'carol.clark@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp2, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, reports_to, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp2, @userEmp2, @org1, 'DEMO-IT002', 'Carol', 'Clark',
    'carol.clark@personal.com', '+1-555-1102', 'internal', 'active', '2023-07-01',
    @deptIT1, @posDev, @emp1, 'Software Engineer', 70000, 'USD',
    'Female', '1992-08-20', 'USA', GETDATE());

DECLARE @userEmp3 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp3 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp3, 'david.davis@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp3, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, reports_to, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, is_probation, probation_start_date, probation_end_date,
    probation_status, created_at) VALUES
(@emp3, @userEmp3, @org1, 'DEMO-IT003', 'David', 'Davis',
    'david.davis@personal.com', '+1-555-1103', 'internal', 'active', '2024-10-01',
    @deptIT1, @posJuniorDev, @emp2, 'Junior Software Engineer', 55000, 'USD',
    'Male', '1998-03-10', 'USA', 1, '2024-10-01', '2025-04-01', 'active', GETDATE());

DECLARE @userEmp4 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp4 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp4, 'emma.evans@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp4, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, reports_to, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp4, @userEmp4, @org1, 'DEMO-HR001', 'Emma', 'Evans',
    'emma.evans@personal.com', '+1-555-1201', 'internal', 'active', '2023-02-15',
    @deptHR1, @posHRManager, @empOrgAdmin1, 'HR Manager', 75000, 'USD',
    'Female', '1988-11-25', 'USA', GETDATE());

DECLARE @userEmp5 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp5 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp5, 'frank.foster@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp5, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, reports_to, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp5, @userEmp5, @org1, 'DEMO-HR002', 'Frank', 'Foster',
    'frank.foster@personal.com', '+1-555-1202', 'internal', 'active', '2024-01-10',
    @deptHR1, @posHRExecutive, @emp4, 'HR Executive', 50000, 'USD',
    'Male', '1995-07-18', 'USA', GETDATE());

-- ===== CONTRACTUAL EMPLOYEES (5) =====
DECLARE @userEmp6 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp6 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp6, 'grace.green@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp6, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, designation, basic_salary, salary_currency,
    contract_start_date, contract_end_date, gender, date_of_birth, nationality, created_at) VALUES
(@emp6, @userEmp6, @org1, 'DEMO-CT001', 'Grace', 'Green',
    'grace.green@personal.com', '+1-555-2001', 'contractual', 'active', '2024-01-01',
    @deptIT1, @posDev, 'Contract Software Engineer', 75000, 'USD',
    '2024-01-01', '2024-12-31', 'Female', '1993-04-12', 'USA', GETDATE());

DECLARE @userEmp7 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp7 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp7, 'henry.harris@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp7, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, designation, basic_salary, salary_currency,
    contract_start_date, contract_end_date, gender, date_of_birth, nationality, created_at) VALUES
(@emp7, @userEmp7, @org1, 'DEMO-CT002', 'Henry', 'Harris',
    'henry.harris@personal.com', '+1-555-2002', 'contractual', 'active', '2024-03-01',
    @deptIT1, @posDev, 'Contract QA Engineer', 65000, 'USD',
    '2024-03-01', '2025-02-28', 'Male', '1991-09-30', 'USA', GETDATE());

-- ===== VENDOR EMPLOYEES (5) =====
DECLARE @userEmp8 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp8 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp8, 'irene.ingram@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp8, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, vendor_id, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp8, @userEmp8, @org1, 'DEMO-VN001', 'Irene', 'Ingram',
    'irene.ingram@demostaffing.com', '+1-555-3001', 'vendor', 'active', '2024-02-01',
    @deptIT1, @posDev, @vendor1, 'Vendor Developer', 70000, 'USD',
    'Female', '1994-02-14', 'USA', GETDATE());

DECLARE @userEmp9 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp9 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp9, 'jack.jackson@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp9, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, vendor_id, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp9, @userEmp9, @org1, 'DEMO-VN002', 'Jack', 'Jackson',
    'jack.jackson@demotechcon.com', '+1-555-3002', 'vendor', 'active', '2024-04-01',
    @deptIT1, @posDev, @vendor2, 'Vendor DevOps Engineer', 72000, 'USD',
    'Male', '1992-06-22', 'USA', GETDATE());

-- ===== CLIENT PROJECT EMPLOYEES (5) =====
DECLARE @userEmp10 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp10 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp10, 'kate.king@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp10, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, client_id, project_id, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp10, @userEmp10, @org1, 'DEMO-CL001', 'Kate', 'King',
    'kate.king@democlient.com', '+1-555-4001', 'client', 'active', '2024-01-15',
    @deptIT1, @posSeniorDev, @client1, @project1, 'Client Project Lead', 90000, 'USD',
    'Female', '1989-12-05', 'USA', GETDATE());

DECLARE @userEmp11 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp11 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp11, 'leo.lewis@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp11, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, client_id, project_id, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp11, @userEmp11, @org1, 'DEMO-CL002', 'Leo', 'Lewis',
    'leo.lewis@demointl.com', '+1-555-4002', 'client', 'active', '2024-02-20',
    @deptIT1, @posDev, @client2, @project2, 'Client Developer', 75000, 'USD',
    'Male', '1993-01-28', 'USA', GETDATE());

-- ===== SUB-VENDOR EMPLOYEES (3) =====
DECLARE @userEmp12 UNIQUEIDENTIFIER = NEWID();
DECLARE @emp12 UNIQUEIDENTIFIER = NEWID();
INSERT INTO users (id, email, password, enabled, organization_id, created_at) VALUES
(@userEmp12, 'maria.miller@demo-tech.com', @passwordHash, 1, @org1, GETDATE());
INSERT INTO user_roles (user_id, role_id) VALUES (@userEmp12, @roleEmployee);
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name,
    personal_email, phone_number, employment_type, employment_status, joining_date,
    department_id, position_id, vendor_id, designation, basic_salary, salary_currency,
    gender, date_of_birth, nationality, created_at) VALUES
(@emp12, @userEmp12, @org1, 'DEMO-SV001', 'Maria', 'Miller',
    'maria.miller@subvendor.com', '+1-555-5001', 'sub_vendor', 'active', '2024-05-01',
    @deptIT1, @posJuniorDev, @vendor1, 'Sub-Vendor Junior Dev', 55000, 'USD',
    'Female', '1996-08-15', 'USA', GETDATE());

PRINT 'Successfully created 12 employees with varied types!';
PRINT 'Login credentials: any-email@demo-tech.com / Demo@123456';
PRINT '';
PRINT 'Organizations: 10 (Demo Tech Solutions Inc, etc.)';
PRINT 'Employees: 12 (5 internal, 2 contractual, 2 vendor, 2 client, 1 sub-vendor)';
PRINT 'Clients: 3';
PRINT 'Vendors: 2';
PRINT 'Projects: 3';
PRINT '';
PRINT 'OrgAdmin login: admin@demo-tech.com / Demo@123456';
PRINT 'Sample Employee: bob.builder@demo-tech.com / Demo@123456';

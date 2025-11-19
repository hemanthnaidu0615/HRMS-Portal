# Demo Data Setup Guide

## 🚀 Quick Start (Recommended)

The easiest way to load demo data is using the automatic data loader:

### Option 1: Run with Demo Profile (EASIEST)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo
```

OR set environment variable:

```bash
export SPRING_PROFILES_ACTIVE=demo
./mvnw spring-boot:run
```

That's it! The application will automatically create:
- ✅ 10 Organizations
- ✅ 12 Employees (5 internal, 2 contractual, 2 vendor, 2 client, 1 sub-vendor)
- ✅ 5 Departments per org
- ✅ 6 Positions per org
- ✅ 3 Clients
- ✅ 2 Vendors
- ✅ 3 Projects

---

## 📋 Demo Credentials

### SuperAdmin (if created during initial setup)
- Email: `your-superadmin-email`
- Password: `your-superadmin-password`

### OrgAdmin for Demo Tech Solutions Inc
- Email: `admin@demo-tech.com`
- Password: `Demo@123456`

### Sample Employees
- `bob.builder@demo-tech.com` / `Demo@123456` (Internal, Senior Dev)
- `carol.clark@demo-tech.com` / `Demo@123456` (Internal, Mid Dev)
- `david.davis@demo-tech.com` / `Demo@123456` (Internal, Junior Dev - ON PROBATION)
- `grace.green@demo-tech.com` / `Demo@123456` (Contractual)
- `irene.ingram@demo-tech.com` / `Demo@123456` (Vendor Employee)
- `kate.king@demo-tech.com` / `Demo@123456` (Client Project Employee)

---

## 📊 What Gets Created

### Organizations (10)
1. Demo Tech Solutions Inc ⭐ (with full data)
2. Demo Healthcare Systems
3. Demo Financial Services
4. Demo Retail Corp
5. Demo Manufacturing Ltd
6. Demo Consulting Group
7. Demo Education Platform
8. Demo Logistics Pro
9. Demo Media & Entertainment
10. Demo Startup Hub

### Departments (for Demo Tech Solutions Inc)
- Information Technology
- Human Resources
- Finance
- Sales & Marketing
- Operations

### Positions
- Engineering Manager (Manager level)
- Senior Software Engineer (Senior level)
- Software Engineer (Mid level)
- Junior Software Engineer (Junior level)
- HR Manager (Manager level)
- HR Executive (Executive level)

### Clients
- Demo Client Corp (CL001)
- Demo International Ltd (CL002)
- Demo Enterprise Solutions (CL003)

### Vendors
- Demo Staffing Solutions (VN001)
- Demo Tech Contractors (VN002)

### Projects
- Demo ERP Implementation (PRJ001) - for Demo Client Corp
- Demo Mobile App (PRJ002) - for Demo International Ltd
- Demo Cloud Migration (PRJ003) - for Demo Enterprise Solutions

### Employees by Type

**Internal Employees (5)**
- Alice Anderson (Director of Engineering) - OrgAdmin
- Bob Builder (Senior Software Engineer)
- Carol Clark (Software Engineer)
- David Davis (Junior Software Engineer) - ON PROBATION
- Emma Evans (HR Manager)
- Frank Foster (HR Executive)

**Contractual Employees (2)**
- Grace Green (Contract Software Engineer) - Contract until Dec 2024
- Henry Harris (Contract QA Engineer) - Contract until Feb 2025

**Vendor Employees (2)**
- Irene Ingram (Vendor Developer) - from Demo Staffing Solutions
- Jack Jackson (Vendor DevOps Engineer) - from Demo Tech Contractors

**Client Project Employees (2)**
- Kate King (Client Project Lead) - working on Demo ERP Implementation
- Leo Lewis (Client Developer) - working on Demo Mobile App

**Sub-Vendor Employees (1)**
- Maria Miller (Sub-Vendor Junior Dev) - sub-contracted via Demo Staffing Solutions

---

## Option 2: Manual SQL Import (Alternative)

If you prefer SQL import, use the `seed-test-data.sql` file:

```bash
# Connect to your SQL Server
sqlcmd -S localhost -U sa -P YourPassword -i seed-test-data.sql
```

---

## 🧪 Testing the Demo Data

After loading, you can test:

1. **Login as OrgAdmin**
   - Go to http://localhost:3000
   - Login: `admin@demo-tech.com` / `Demo@123456`

2. **View Employees**
   - Navigate to Employee Management
   - See 12 employees with different types

3. **View Org Chart**
   - Check hierarchical reporting structure
   - See manager-employee relationships

4. **Test Document Upload**
   - Login as employee
   - Upload documents
   - Test document request workflow

5. **View Dashboards**
   - Check employee distribution
   - View by employment type
   - See probation status

---

## 🔄 Re-loading Data

The data loader checks if demo data already exists (by looking for organizations starting with "Demo ").

To reload:
1. Delete all demo organizations from SuperAdmin panel
2. Restart the application with `demo` profile

OR manually delete from database:
```sql
DELETE FROM employees WHERE employee_code LIKE 'DEMO-%';
DELETE FROM users WHERE email LIKE '%@demo-tech.com';
DELETE FROM organizations WHERE name LIKE 'Demo %';
```

---

## ⚙️ Configuration

The data loader only runs when:
- Spring profile `demo` is active
- Demo data doesn't already exist

To disable, simply don't use the `demo` profile.

---

## 🐛 Troubleshooting

**Issue: Data not loading**
- Check that `demo` profile is active
- Check logs for "Loading demo data..."
- Verify ORGADMIN and EMPLOYEE roles exist in database

**Issue: Duplicate key errors**
- Demo data may already exist
- Check if organizations with "Demo " prefix exist
- Delete existing demo data first

**Issue: Password doesn't work**
- Make sure you're using: `Demo@123456` (case sensitive)
- Check BCrypt encoder is configured

---

## 📝 Notes

- All demo emails end with `@demo-tech.com` or `@personal.com`
- Employee codes start with `DEMO-` prefix
- Passwords are properly hashed with BCrypt
- Data includes realistic relationships (managers, departments, projects)
- One employee (David Davis) is on probation for testing probation features
- Contractual employees have contract end dates
- Vendor/Client employees are linked to their respective vendors/clients

---

## 🎯 For Your Demo Tonight

**Key Features to Show:**
1. ✅ Multiple employee types (internal, contractual, vendor, client, sub-vendor)
2. ✅ Organizational hierarchy with reporting structure
3. ✅ Employee on probation (David Davis)
4. ✅ Employees assigned to clients and projects
5. ✅ Document management system (upload and request)
6. ✅ Dashboard with analytics
7. ✅ Various departments and positions

**Safe to Demo:**
- Employee management (all CRUD operations)
- Document upload/request/approval
- Organization structure (departments/positions)
- Project management
- Client/Vendor management
- Dashboards and reporting
- Audit logs

**Avoid Showing:**
- Leave, Attendance, Timesheet, Payroll modules (not implemented)
- Performance, Recruitment, Assets, Expenses modules (not implemented)

---

Good luck with your demo! 🎉

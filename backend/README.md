# HRMS Backend

Complete Spring Boot backend for Human Resource Management System with JWT authentication, role-based access control, and SQL Server database.

## Features

- Spring Boot 3.2.0
- Spring Security with JWT (HS256)
- Spring Data JPA with SQL Server
- Spring Mail for email notifications
- Role-based access control (SuperAdmin, OrgAdmin, Employee)
- Automatic SuperAdmin creation on startup
- Password change enforcement for new users
- Stateless authentication (no server-side sessions)

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- SQL Server database (Azure SQL or local)
- SMTP server credentials for email (configured in application.properties)

## Setup

### 1. Database Setup

Run the `schema.sql` file in your SQL Server database to create the required tables and insert the default roles:

```bash
sqlcmd -S hrms-meridian.database.windows.net -d hrms-db -U Meridian -P YOUR_PASSWORD -i schema.sql
```

Or execute the SQL script manually in your SQL client.

### 2. Configuration

Update the database password in `src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

All other configurations are already set as per requirements.

### 3. Build and Run

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The application will start on port 8080 by default.

### 4. Initial SuperAdmin

On startup, the application automatically creates a SuperAdmin user if one doesn't exist:

- **Email:** superadmin@hrms.com
- **Password:** admin123

## API Endpoints

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "superadmin@hrms.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "uuid",
  "email": "superadmin@hrms.com",
  "roles": ["superadmin"],
  "mustChangePassword": false
}
```

#### Set Password (First-time password setup)
```http
POST /auth/set-password
Content-Type: application/json

{
  "email": "user@example.com",
  "temporaryPassword": "temp123",
  "newPassword": "newSecurePassword123"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note:** Logout is primarily client-side by clearing JWT from localStorage.

---

### SuperAdmin Endpoints

All SuperAdmin endpoints require `ROLE_SUPERADMIN` and JWT token in the `Authorization` header.

#### Create Organization
```http
POST /api/superadmin/organizations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Acme Corporation"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "createdAt": "2025-11-14T10:30:00"
}
```

#### Get All Organizations
```http
GET /api/superadmin/organizations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "createdAt": "2025-11-14T10:30:00"
  }
]
```

#### Create Organization Admin
```http
POST /api/superadmin/organizations/{orgId}/orgadmin
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "email": "admin@acme.com",
  "temporaryPassword": "temp123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@acme.com",
  "organizationId": "uuid",
  "mustChangePassword": true
}
```

**Note:** An email is sent to the org admin with their temporary password.

---

### Organization Admin Endpoints

All OrgAdmin endpoints require `ROLE_ORGADMIN` and JWT token in the `Authorization` header.

#### Create Employee
```http
POST /api/orgadmin/employees
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "email": "employee@acme.com",
  "temporaryPassword": "temp123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "employee@acme.com",
  "organizationId": "uuid",
  "mustChangePassword": true
}
```

**Note:** An email is sent to the employee with their temporary password.

#### Get All Employees
```http
GET /api/orgadmin/employees
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "employee@acme.com",
    "organizationId": "uuid",
    "mustChangePassword": true
  }
]
```

---

### Employee Endpoints

Currently, employees only have access to:
- Login (`/auth/login`)
- Set Password (`/auth/set-password`)
- Logout (`/auth/logout`)

Additional employee-specific features can be added as needed.

## JWT Token Format

The JWT token includes the following claims:

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "roles": ["superadmin"],
  "sub": "user@example.com",
  "iat": 1699963200,
  "exp": 1700049600
}
```

- **Algorithm:** HS256
- **Secret:** Configured in application.properties
- **Expiration:** 24 hours
- **Storage:** Frontend stores in localStorage
- **Header:** Send as `Authorization: Bearer <token>`

## Role-Based Access Control

| Role | Access |
|------|--------|
| **SuperAdmin** | Create organizations, create org admins, view all organizations |
| **OrgAdmin** | Create employees in their organization, view employees in their organization |
| **Employee** | Login, set password (no additional endpoints yet) |

## Security Features

1. **Stateless Authentication:** No server-side sessions, all state is in JWT
2. **Password Encryption:** BCrypt hashing for all passwords
3. **Role Verification:** Exact role matching with Spring Security
4. **CORS Enabled:** Configured for cross-origin requests
5. **Validation:** Input validation on all request DTOs
6. **Exception Handling:** Global exception handler for consistent error responses

## Email Configuration

Emails are sent for:
- New organization admin accounts (temporary password)
- New employee accounts (temporary password)

Email settings in `application.properties`:
- Host: smtp.gmail.com
- Port: 587
- Username: test.meridiantechsol@gmail.com
- Uses TLS encryption

## Database Schema

The application uses the following tables:

- **roles:** Stores role definitions (superadmin, orgadmin, employee)
- **organizations:** Stores organization information
- **users:** Stores user accounts with email, password, and organization link
- **user_roles:** Many-to-many relationship between users and roles

All tables are pre-created using the `schema.sql` script.

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

For validation errors:
```json
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password is required"
  }
}
```

## Development Notes

- JPA `hibernate.ddl-auto` is set to `none` - schema is managed via SQL scripts
- SQL queries are logged via `spring.jpa.show-sql=true`
- Default server port: 8080
- Context path: `/` (root)

## Testing

Example using curl:

```bash
# Login as superadmin
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@hrms.com","password":"admin123"}'

# Create organization (use token from login)
curl -X POST http://localhost:8080/api/superadmin/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Corp"}'
```

## Project Structure

```
backend/
├── src/main/java/com/hrms/
│   ├── config/              # Security, DataInitializer
│   ├── controller/          # REST controllers
│   ├── dto/                 # Request/Response DTOs
│   ├── entity/              # JPA entities
│   ├── exception/           # Exception handlers
│   ├── repository/          # JPA repositories
│   ├── security/            # JWT filter
│   ├── service/             # Business logic
│   └── HrmsApplication.java # Main application
├── src/main/resources/
│   └── application.properties
├── schema.sql
├── pom.xml
└── README.md
```

## License

Proprietary - HRMS Application

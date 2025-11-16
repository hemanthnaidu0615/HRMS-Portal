# HRMS Portal - Remaining Security & Quality Fixes

## ✅ COMPLETED (Phase 1)

### Critical Security Fixes
- ✅ CRIT-1: Fixed CORS configuration (environment-based, no wildcards)
- ✅ CRIT-2: Added comprehensive JWT validation logging
- ✅ CRIT-4: Removed insecure JWT secret default + validation on startup
- ✅ CRIT-5: Created FileValidationService with Apache Tika content detection
- ✅ HIGH-1: Implemented RateLimitingFilter for auth endpoints (Bucket4j)
- ✅ HIGH-2: Added password complexity validation (Passay service + DTO annotations)

### Infrastructure Improvements
- ✅ Added dependencies: SpringDoc OpenAPI, Caffeine Cache, Bucket4j, Actuator, Apache Tika, Passay
- ✅ Configured HikariCP connection pooling with leak detection
- ✅ Added health checks and metrics endpoints
- ✅ Configured Caffeine caching
- ✅ Added API documentation (Swagger)
- ✅ Improved application.properties with proper defaults
- ✅ Added structured logging configuration

## 🔴 REMAINING CRITICAL FIXES

### CRIT-3: Client-Side Permission Hardcoding
**File:** `frontend/src/auth/useAuth.ts`
**Action Required:**
1. Create backend endpoint `/api/me/permissions` that returns user's effective permissions
2. Update useAuth to fetch permissions from backend on login
3. Remove hardcoded rolePermissions mapping

```typescript
// In useAuth.ts, replace hardcoded permissions with:
const [permissions, setPermissions] = useState<string[]>([]);

useEffect(() => {
  if (token) {
    fetch('/api/me/permissions')
      .then(res => res.json())
      .then(perms => setPermissions(perms));
  }
}, [token]);
```

**Backend Implementation:**
```java
@GetMapping("/api/me/permissions")
public ResponseEntity<Set<String>> getMyPermissions(Authentication auth) {
    User user = userService.findByEmail(auth.getName())...;
    Employee employee = employeeRepository.findByUser_Id(user.getId())...;
    Set<String> permissions = permissionService.getEffectivePermissions(employee);
    return ResponseEntity.ok(permissions);
}
```

## 🟠 HIGH PRIORITY FIXES

### HIGH-3: Missing Organization Boundary Checks
**Files to Update:**

1. **DocumentController.java:243-302** (`downloadDocument` method)
```java
// Add after line 252:
if (!document.getEmployee().getOrganization().getId()
        .equals(currentEmployee.getOrganization().getId())) {
    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
}
```

2. **DocumentController.java:168-200** (`getEmployeeDocuments` method)
```java
// Add organization check before permission checks
```

### HIGH-4: Circular Reporting Detection
**File:** `backend/src/main/java/com/hrms/service/EmployeeService.java`

**Add method:**
```java
public boolean wouldCreateCycle(UUID newManagerId, UUID employeeId) {
    Set<UUID> visited = new HashSet<>();
    UUID current = newManagerId;

    while (current != null) {
        if (current.equals(employeeId)) {
            return true; // Cycle detected
        }
        if (!visited.add(current)) {
            return false; // Loop but not to employee
        }

        Optional<Employee> manager = employeeRepository.findById(current);
        current = manager.flatMap(m -> Optional.ofNullable(m.getReportsTo()))
            .map(Employee::getId)
            .orElse(null);
    }
    return false;
}
```

**Update EmployeeManagementController.java:113-123:**
```java
if (request.getReportsToEmployeeId().equals(employeeId)) {
    throw new RuntimeException("Employee cannot report to themselves");
}

// ADD THIS:
if (employeeService.wouldCreateCycle(request.getReportsToEmployeeId(), employeeId)) {
    throw new RuntimeException("This assignment would create a circular reporting structure");
}
```

### HIGH-5: Inconsistent Route Protection (Frontend)
**File:** `frontend/src/App.tsx`

**Changes:**
1. Line 147: Remove `requiredRole="employee"` - allow orgadmin/superadmin access
2. Line 179: Change `requiredRole="orgadmin"` to handle SUPERADMIN too
3. Create reusable `requireAnyRole={["orgadmin", "superadmin"]}` pattern

### HIGH-6: ProtectedRoute Incorrect Redirect
**File:** `frontend/src/auth/ProtectedRoute.tsx:16-18`

**Change:**
```typescript
if (requiredRole && !roles.includes(requiredRole)) {
  // Don't redirect to login - show 403 or redirect to default route
  return <Navigate to={getDefaultRoute(roles)} replace />;
}
```

### HIGH-9: Missing Pagination
**Files:**
- `EmployeeManagementController.java:36-53`
- `DocumentController.java:202-241`

**Pattern:**
```java
@GetMapping
public ResponseEntity<Page<EmployeeSummaryResponse>> getEmployees(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        Authentication authentication) {
    Pageable pageable = PageRequest.of(page, Math.min(size, 100));
    Page<Employee> employees = employeeRepository.findByOrganization(org, pageable);
    return ResponseEntity.ok(employees.map(this::mapToSummary));
}
```

### HIGH-11: HTTP 401/403 Handling
**File:** `frontend/src/api/http.ts:33-39`

**Fix:**
```typescript
if (error.response?.status === 401) {
  // Only logout on authentication failure
  localStorage.removeItem('token');
  localStorage.removeItem('roles');
  localStorage.removeItem('user');
  window.location.href = '/login';
} else if (error.response?.status === 403) {
  // Permission denied - don't logout
  message.error('You do not have permission to perform this action');
}
```

### HIGH-12: Reporting Tree O(n²) Query
**File:** `EmployeeService.java:135-147`

**Optimized version:**
```java
@Cacheable(value = "reportingTrees", key = "#employeeId")
public List<Employee> getReportingTree(UUID employeeId) {
    Employee manager = employeeRepository.findById(employeeId)
        .orElseThrow(() -> new RuntimeException("Employee not found"));

    // Load all employees in organization once
    List<Employee> allEmployees = employeeRepository
        .findByOrganization(manager.getOrganization());

    // Build tree in memory (single DB query)
    return collectReportsInMemory(employeeId, allEmployees);
}

private List<Employee> collectReportsInMemory(UUID managerId, List<Employee> allEmployees) {
    // Recursive collection from in-memory list
}
```

## 🟡 MEDIUM PRIORITY FIXES

### MED-1: Email Failure Handling
**Files:** `SuperAdminController.java:82-87`, `PasswordResetController.java:42-47`

**Pattern:**
```java
try {
    emailService.sendTemporaryPasswordEmail(...);
} catch (Exception e) {
    logger.error("Failed to send email to {}: {}", request.getEmail(), e.getMessage());
    response.put("warning", "User created but email delivery failed");
    return ResponseEntity.status(207).body(response); // Multi-status
}
```

### MED-3: Missing DB Constraint
**Create migration:**
```sql
ALTER TABLE employees ADD CONSTRAINT uk_employee_user UNIQUE (user_id);
```

### MED-4: Error Message Sanitization
**File:** `GlobalExceptionHandler.java:47-53`

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
    logger.error("Unhandled exception", ex); // Log full stack

    Map<String, String> error = new HashMap<>();
    error.put("error", "An unexpected error occurred");
    error.put("requestId", UUID.randomUUID().toString());
    // Don't expose ex.getMessage() in production

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
}
```

### MED-6: localStorage Security
**File:** `frontend/src/auth/useAuth.ts:8-12`

**Consider using sessionStorage:**
```typescript
const token = sessionStorage.getItem('token'); // Clears on browser close
```

### MED-9: Cache Reporting Trees
**Already created CacheConfig** - just add `@Cacheable` annotations to EmployeeService methods

## 🔵 LOW PRIORITY IMPROVEMENTS

### LOW-1: API Versioning
- Add `/api/v1/` prefix to all new endpoints
- Maintain legacy routes for backward compatibility (already done in SecurityConfig)

### LOW-3: API Documentation
- Already added SpringDoc OpenAPI
- Access at: `http://localhost:8080/swagger-ui.html`

### LOW-4: Standard Error Response
**Create ErrorResponse DTO:**
```java
public class ErrorResponse {
    private String error;
    private String message;
    private String requestId;
    private LocalDateTime timestamp;
}
```

## 📋 IMPLEMENTATION CHECKLIST

### Backend Services
- [ ] Create `/api/me/permissions` endpoint (PermissionController)
- [ ] Add `wouldCreateCycle` to EmployeeService
- [ ] Add organization boundary checks to all document methods
- [ ] Add `@Cacheable` to EmployeeService.getReportingTree
- [ ] Update GlobalExceptionHandler error sanitization
- [ ] Add pagination to all list endpoints

### Backend Controllers
- [ ] DocumentController - org boundaries (3 methods)
- [ ] EmployeeManagementController - circular detection
- [ ] EmployeeManagementController - pagination
- [ ] DocumentController - pagination
- [ ] Create PermissionController for /api/me/permissions

### Frontend
- [ ] Update useAuth.ts - fetch permissions from backend
- [ ] Fix ProtectedRoute.tsx - proper 403 handling
- [ ] Fix App.tsx - route role requirements
- [ ] Fix http.ts - differentiate 401 vs 403

### Database
- [ ] Create migration for user_id unique constraint
- [ ] Add version column to Employee entity for optimistic locking

### Testing
- [ ] Test rate limiting (5 requests/minute on auth endpoints)
- [ ] Test file upload validation (rejects exe, validates MIME types)
- [ ] Test circular reporting detection
- [ ] Test organization boundaries (cross-org access blocked)
- [ ] Test password complexity validation
- [ ] Test pagination limits

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:
1. Set strong JWT secret (32+ chars): `SECURITY_JWT_SECRET`
2. Configure allowed CORS origins: `CORS_ALLOWED_ORIGINS`
3. Review rate limiting thresholds
4. Enable HTTPS redirect in nginx
5. Set appropriate log levels
6. Configure database connection pool limits
7. Test health check endpoints

## 📝 NOTES

- All CRITICAL and most HIGH priority backend security issues are fixed in Phase 1
- Frontend fixes require minimal changes (4 files)
- Remaining backend fixes are mostly adding boundaries and optimizations
- Total remaining effort: ~2-3 hours for experienced developer

---

**Next Steps:**
1. Review and approve Phase 1 changes
2. Implement remaining HIGH priority fixes
3. Test thoroughly in staging
4. Deploy to production with proper secrets

# 🔒 HRMS Security Implementation Roadmap

## Executive Summary

This document outlines security gaps found in the HRMS permission system and provides a prioritized roadmap for fixes.

**Current Status:** ⚠️ **PARTIALLY SECURED**

✅ **COMPLETED (This PR):**
- Audit logging infrastructure
- Privilege escalation prevention
- Permission assignment security hardening

❌ **CRITICAL GAPS REMAINING:**
- Most controllers bypass granular permissions
- No user management API
- No role assignment API
- Frontend uses role-based navigation (not permission-based)

---

## 🚨 Critical Vulnerabilities (HIGH PRIORITY)

### 1. Controllers Not Enforcing Granular Permissions

**Severity:** 🔴 **CRITICAL**

**Problem:**
We created 91 granular permissions but most controllers only check roles:
```java
@PreAuthorize("hasRole('ORGADMIN')")  // ❌ Bypasses granular permissions
```

**Affected Controllers:**
- `PermissionGroupController.java:19`
- `OrganizationStructureController.java:28`
- `DocumentApprovalController.java:26`
- `RoleController.java:22`

**Impact:**
Anyone with ORGADMIN role gets full access, making granular permissions useless.

**Fix Required:**
Replace role checks with permission checks:

```java
// BEFORE (insecure)
@PreAuthorize("hasRole('ORGADMIN')")
public ResponseEntity<?> createDepartment(...) {
    // No permission check!
}

// AFTER (secure)
public ResponseEntity<?> createDepartment(..., Authentication auth) {
    User user = userService.findByEmail(auth.getName());

    if (!permissionService.hasPermission(user, "departments", "create", "organization")) {
        return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
    }

    // Continue...
}
```

**Files to Update:**
1. `OrganizationStructureController.java`
   - Add permission checks for departments:create/edit/delete
   - Add permission checks for positions:create/edit/delete

2. `DocumentApprovalController.java`
   - Add documents:approve:organization check

3. `PermissionGroupController.java`
   - Add permission-groups:view:organization check

4. `RoleController.java`
   - Add roles:view/create/edit/delete:organization checks

**Estimated Effort:** 4-6 hours

---

### 2. No User Management API

**Severity:** 🔴 **CRITICAL**

**Problem:**
Created permissions for user management but no endpoints to use them:
- `users:view:organization`
- `users:create:organization`
- `users:edit:organization`
- `users:delete:organization`
- `users:reset-password:organization`

**Impact:**
Org admins cannot create/manage users programmatically.

**Fix Required:**
Create `UserManagementController.java` with these endpoints:

```java
@RestController
@RequestMapping("/api/orgadmin/users")
public class UserManagementController {

    // GET /api/orgadmin/users - List all users in organization
    // Requires: users:view:organization

    // POST /api/orgadmin/users - Create new user
    // Requires: users:create:organization
    // Security: Must prevent privilege escalation

    // GET /api/orgadmin/users/{id} - Get user details
    // Requires: users:view:organization

    // PUT /api/orgadmin/users/{id} - Update user
    // Requires: users:edit:organization
    // Security: Cannot modify self

    // DELETE /api/orgadmin/users/{id} - Delete user
    // Requires: users:delete:organization
    // Security: Cannot delete self

    // POST /api/orgadmin/users/{id}/reset-password - Reset password
    // Requires: users:reset-password:organization
    // Security: Audit log with high severity
}
```

**DTOs Required:**
- `UserCreateRequest` (email, password, roles)
- `UserUpdateRequest` (email)
- `UserResponse` (id, email, roles, organization, createdAt)
- `PasswordResetRequest` (newPassword)

**Security Requirements:**
- ✅ Use `permissionService.canManageUser()` for all operations
- ✅ Log all operations with `auditLogService`
- ✅ Prevent self-deletion
- ✅ Prevent self-role-modification
- ✅ Validate organization boundaries

**Estimated Effort:** 6-8 hours

---

### 3. No Role Assignment API

**Severity:** 🟠 **HIGH**

**Problem:**
Created `roles:assign:organization` permission but no endpoint to assign roles to users.

**Impact:**
Cannot delegate role management, must manually update database.

**Fix Required:**
Add to `UserManagementController.java`:

```java
// PUT /api/orgadmin/users/{userId}/roles
public ResponseEntity<?> assignRoles(
    @PathVariable UUID userId,
    @RequestBody RoleAssignmentRequest request,
    Authentication auth) {

    User currentUser = userService.findByEmail(auth.getName());
    User targetUser = userService.findById(userId);

    // Security check
    if (!permissionService.canAssignRole(currentUser, targetUser)) {
        auditLogService.logPrivilegeEscalationAttempt(...);
        return ResponseEntity.status(403).body(...);
    }

    // Get requested roles
    List<Role> roles = getRolesByIds(request.getRoleIds());

    // Validate roles belong to organization
    for (Role role : roles) {
        if (!isValidRoleForOrg(role, currentUser.getOrganization())) {
            return ResponseEntity.badRequest().body(...);
        }
    }

    // Update roles
    targetUser.setRoles(roles);
    userService.save(targetUser);

    // Audit log
    auditLogService.logRoleAssignment(currentUser, org, userId, roleNames);

    return ResponseEntity.ok(...);
}
```

**DTOs Required:**
- `RoleAssignmentRequest` (roleIds: List<UUID>)
- `UserRolesResponse` (userId, roles: List<RoleResponse>)

**Estimated Effort:** 3-4 hours

---

## 🟡 Medium Priority Gaps

### 4. No Organization Settings API

**Severity:** 🟡 **MEDIUM**

**Permissions Created:**
- `organization:view:organization`
- `organization:edit:organization`

**Missing Endpoints:**
- `GET /api/orgadmin/organization` - View org settings
- `PUT /api/orgadmin/organization` - Update org name/settings

**Estimated Effort:** 2-3 hours

---

### 5. No Audit Log Viewing API

**Severity:** 🟡 **MEDIUM**

**Permissions Created:**
- `audit-logs:view:organization`
- `email-logs:view:organization`

**Missing Endpoints:**
- `GET /api/orgadmin/audit-logs` - View audit trail with filtering
- `GET /api/orgadmin/email-logs` - View email sending history

**Use Cases:**
- Security incident investigation
- Compliance reporting
- User activity monitoring

**Estimated Effort:** 3-4 hours

---

### 6. No Individual Permission Assignment

**Severity:** 🟡 **MEDIUM**

**Current:** Can only assign permission groups
**Missing:** Ability to grant/revoke individual permissions

**Benefits:**
- Fine-grained control
- Custom permission combinations
- Don't need to create groups for every scenario

**Endpoints Needed:**
- `POST /api/orgadmin/employees/{id}/permissions/{permissionId}` - Grant permission
- `DELETE /api/orgadmin/employees/{id}/permissions/{permissionId}` - Revoke permission

**Note:** May require schema change (direct user-permission mapping table)

**Estimated Effort:** 4-5 hours

---

## 🎨 Frontend Gaps (MEDIUM-LOW PRIORITY)

### 7. Permission-Based Navigation

**Current:** Navigation uses roles
```typescript
if (roles.includes('orgadmin')) {
    return orgAdminMenuItems;
}
```

**Problem:**
Doesn't respect granular permissions. Shows menu items user doesn't have access to.

**Fix Required:**
Update `frontend/src/config/navigation.tsx`:

```typescript
// Add permission checks to each menu item
{
    label: 'Departments',
    key: '/admin/structure/departments',
    visible: hasPermission('departments:view:organization')
}

// Implement hasPermission helper
function hasPermission(permission: string): boolean {
    // Call /api/permissions/me endpoint
    // Check if user's permissions include this one
}
```

**New Endpoint Needed:**
```java
// GET /api/permissions/me - Get current user's permissions
public ResponseEntity<Set<String>> getMyPermissions(Authentication auth) {
    User user = userService.findByEmail(auth.getName());
    Set<String> permissions = permissionService.getAllPermissionCodes(user);
    return ResponseEntity.ok(permissions);
}
```

**Estimated Effort:** 4-5 hours

---

### 8. User Management UI

**Required Pages:**
1. **User List Page** (`/admin/users`)
   - Table showing all org users
   - Columns: Email, Roles, Status, Created Date
   - Actions: Edit, Delete, Reset Password
   - Requires: users:view:organization

2. **Create User Page** (`/admin/users/create`)
   - Form: email, password, role selection
   - Requires: users:create:organization

3. **Edit User Page** (`/admin/users/{id}/edit`)
   - Form: email, role assignment
   - Requires: users:edit:organization

4. **Password Reset Modal**
   - Generate new password or let user set it
   - Requires: users:reset-password:organization

**API Integration:**
- `getAllUsers()` → GET /api/orgadmin/users
- `createUser(data)` → POST /api/orgadmin/users
- `updateUser(id, data)` → PUT /api/orgadmin/users/{id}
- `deleteUser(id)` → DELETE /api/orgadmin/users/{id}
- `resetPassword(id, newPassword)` → POST /api/orgadmin/users/{id}/reset-password

**Components Needed:**
- `UserListPage.tsx`
- `UserCreatePage.tsx`
- `UserEditPage.tsx`
- `PasswordResetModal.tsx`
- `UserTable.tsx`
- API: `frontend/src/api/userManagementApi.ts`

**Estimated Effort:** 8-10 hours

---

### 9. Role Assignment UI

**Required Components:**
1. **Role Assignment Modal**
   - Checkbox list of available roles
   - Shows current roles
   - Save/Cancel buttons

2. **Integration Points:**
   - Employee detail page → Assign Roles button
   - User detail page → Assign Roles button

**API Integration:**
- `getUserRoles(userId)` → GET /api/orgadmin/users/{id}/roles
- `assignRoles(userId, roleIds)` → PUT /api/orgadmin/users/{id}/roles

**Estimated Effort:** 3-4 hours

---

## 📋 Implementation Checklist

### Phase 1: Critical Security (Week 1)
- [ ] Update OrganizationStructureController with permission checks
- [ ] Update DocumentApprovalController with permission checks
- [ ] Update PermissionGroupController with permission checks
- [ ] Update RoleController with permission checks
- [ ] Create UserManagementController
- [ ] Add role assignment endpoint
- [ ] Add permission viewing endpoint (/api/permissions/me)

### Phase 2: Management APIs (Week 2)
- [ ] Organization settings API
- [ ] Audit log viewing API
- [ ] Email log viewing API
- [ ] Individual permission assignment (if needed)

### Phase 3: Frontend (Week 3)
- [ ] Permission-based navigation
- [ ] User management UI (list, create, edit, delete)
- [ ] Role assignment UI
- [ ] Password reset UI

### Phase 4: Testing & Hardening (Week 4)
- [ ] Security testing
- [ ] Privilege escalation testing
- [ ] Audit log verification
- [ ] Frontend permission enforcement testing
- [ ] Documentation updates

---

## 🔬 Testing Strategy

### Security Test Cases

**1. Privilege Escalation Prevention:**
```
Test: User tries to modify their own permissions
Expected: 403 Forbidden with "Cannot modify your own permissions"
Audit: Log privilege escalation attempt
```

**2. Cross-Org Access:**
```
Test: Org A admin tries to modify Org B user
Expected: 403 Forbidden
Audit: Log unauthorized access attempt
```

**3. Permission Enforcement:**
```
Test: User without users:create permission tries POST /api/orgadmin/users
Expected: 403 Forbidden
Audit: Log access denied
```

**4. Role-Based Bypass:**
```
Test: ORGADMIN role without granular permission tries protected endpoint
Expected: 403 Forbidden (not allowed by role alone)
```

### Audit Log Verification

For every security-critical operation, verify:
- ✅ Audit entry created
- ✅ IP address captured
- ✅ Before/after values logged
- ✅ Metadata includes all relevant context
- ✅ Failed attempts logged separately

---

## 📊 Progress Tracking

**Overall Completion:** 30% ✅●●●○○○○○○○

| Category | Status | % Complete |
|----------|--------|------------|
| Audit Logging | ✅ Complete | 100% |
| Privilege Escalation Prevention | ✅ Complete | 100% |
| Permission Assignment Security | ✅ Complete | 100% |
| Controller Permission Checks | ⚠️ Partial (1/5) | 20% |
| User Management API | ❌ Not Started | 0% |
| Role Assignment API | ❌ Not Started | 0% |
| Organization API | ❌ Not Started | 0% |
| Audit/Log Viewing API | ❌ Not Started | 0% |
| Permission-Based Navigation | ❌ Not Started | 0% |
| User Management UI | ❌ Not Started | 0% |

---

## 🎯 Success Criteria

System is considered secure when:

✅ All controllers enforce granular permissions (not just roles)
✅ All security-critical operations are audit logged
✅ Privilege escalation is impossible
✅ Users cannot modify their own permissions/roles
✅ Cross-organization access is prevented
✅ Frontend hides features user doesn't have access to
✅ All test cases pass
✅ Security review completed

---

## 📚 References

- **Schema:** `backend/schema.sql` (lines 333-370) - Permission definitions
- **Permission Initializer:** `backend/src/main/java/com/hrms/config/PermissionInitializer.java`
- **Permission Service:** `backend/src/main/java/com/hrms/service/PermissionService.java`
- **Audit Service:** `backend/src/main/java/com/hrms/service/AuditLogService.java`
- **Example Secure Controller:** `backend/src/main/java/com/hrms/controller/DocumentRequestController.java`

---

## 💡 Quick Wins

If time is limited, prioritize these high-impact, low-effort fixes:

1. **Add permission check to PermissionGroupController** (30 min)
   - Single line: `if (!permissionService.hasPermission(user, "permission-groups", "view", "organization"))`

2. **Add GET /api/permissions/me endpoint** (30 min)
   - Enables frontend permission checks

3. **Update navigation visibility logic** (1 hour)
   - Use permissions from /api/permissions/me

4. **Create basic user list page** (2 hours)
   - Read-only view of users
   - No create/edit, just visibility

These 4 items give 70% of the security improvement for 20% of the effort.

---

**Last Updated:** 2025-01-17
**Created By:** Claude (Security Audit)
**Status:** 🚧 Work in Progress

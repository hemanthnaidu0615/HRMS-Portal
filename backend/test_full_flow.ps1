$ErrorActionPreference = "Stop"

function Login($email, $password) {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" -Method Post -Body $body -ContentType "application/json"
        return $response.token
    } catch {
        Write-Error "Login failed for $email. Status: $($_.Exception.Response.StatusCode.value__)"
    }
}

function Create-Org($token) {
    $body = @{ name = "Test Corp $(Get-Random)"; country = "USA" } | ConvertTo-Json
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/superadmin/organizations" -Method Post -Body $body -ContentType "application/json" -Headers $headers
    return $response
}

function Create-OrgAdmin($token, $orgId) {
    $email = "admin$(Get-Random)@testcorp.com"
    $password = "StrongPass123!"
    $body = @{ email = $email; temporaryPassword = $password } | ConvertTo-Json
    Write-Host "Creating OrgAdmin with body: $body"
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/superadmin/organizations/$orgId/orgadmin" -Method Post -Body $body -ContentType "application/json" -Headers $headers
    return @{ email = $email; password = $password }
}

function Create-Dept($token) {
    $body = @{ name = "Engineering" } | ConvertTo-Json
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/orgadmin/structure/departments" -Method Post -Body $body -ContentType "application/json" -Headers $headers
    return $response
}

function Create-Position($token) {
    $body = @{ name = "Developer"; seniorityLevel = 1 } | ConvertTo-Json
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/orgadmin/structure/positions" -Method Post -Body $body -ContentType "application/json" -Headers $headers
    return $response
}

function Create-Employee($token, $deptId, $posId) {
    $code = "EMP-$(Get-Random)"
    $email = "emp$(Get-Random)@testcorp.com"
    $body = @{
        firstName = "John"
        lastName = "Doe"
        email = $email
        employeeCode = $code
        joiningDate = "2024-01-01"
        employmentType = "full_time"
        departmentId = $deptId
        positionId = $posId
        currentAddressLine1 = "123 Main St"
        currentCity = "New York"
        currentCountry = "USA"
        bankAccountNumber = "123456789"
        accountHolderName = "John Doe"
        bankName = "Test Bank"
        ssnNumber = "123-45-6789"
        temporaryPassword = "Password123!"
    } | ConvertTo-Json
    
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/orgadmin/employees" -Method Post -Body $body -ContentType "application/json" -Headers $headers
    return $response
}

# 1. Login SuperAdmin
Write-Host "Logging in as SuperAdmin..."
$saToken = Login "superadmin@hrms.com" "admin123"
Write-Host "SuperAdmin Token acquired."

# 2. Create Org
Write-Host "Creating Organization..."
$org = Create-Org $saToken
Write-Host "Organization created: $($org.name) ($($org.id))"

# 3. Create OrgAdmin
Write-Host "Creating OrgAdmin..."
$adminCreds = Create-OrgAdmin $saToken $org.id
Write-Host "OrgAdmin created: $($adminCreds.email)"

# 4. Login OrgAdmin
Write-Host "Logging in as OrgAdmin..."
$oaToken = Login $adminCreds.email $adminCreds.password
Write-Host "OrgAdmin Token acquired."

# 5. Create Dept
Write-Host "Creating Department..."
$dept = Create-Dept $oaToken
Write-Host "Department created: $($dept.name) ($($dept.id))"

# 6. Create Position
Write-Host "Creating Position..."
$pos = Create-Position $oaToken
Write-Host "Position created: $($pos.name) ($($pos.id))"

# 7. Create Employee
Write-Host "Creating Employee..."
$emp = Create-Employee $oaToken $dept.id $pos.id
Write-Host "Employee created: $($emp.firstName) $($emp.lastName) ($($emp.employeeId))"

Write-Host "FULL FLOW SUCCESS!"

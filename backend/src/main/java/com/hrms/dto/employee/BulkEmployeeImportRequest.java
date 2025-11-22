package com.hrms.dto.employee;

import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvDate;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * DTO for CSV row during bulk employee import.
 * Maps CSV columns to Java fields for parsing and validation.
 */
public class BulkEmployeeImportRequest {

    // ==================== Required Fields ====================

    @CsvBindByName(column = "employee_code", required = true)
    @NotBlank(message = "Employee code is required")
    @Size(max = 50, message = "Employee code must not exceed 50 characters")
    private String employeeCode;

    @CsvBindByName(column = "first_name", required = true)
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;

    @CsvBindByName(column = "last_name", required = true)
    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;

    @CsvBindByName(column = "email", required = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    // ==================== Optional Personal Info ====================

    @CsvBindByName(column = "middle_name")
    @Size(max = 100, message = "Middle name must not exceed 100 characters")
    private String middleName;

    @CsvBindByName(column = "preferred_name")
    @Size(max = 100, message = "Preferred name must not exceed 100 characters")
    private String preferredName;

    @CsvBindByName(column = "date_of_birth")
    @CsvDate(value = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @CsvBindByName(column = "gender")
    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @CsvBindByName(column = "marital_status")
    @Size(max = 30, message = "Marital status must not exceed 30 characters")
    private String maritalStatus;

    @CsvBindByName(column = "nationality")
    @Size(max = 100, message = "Nationality must not exceed 100 characters")
    private String nationality;

    // ==================== Contact Information ====================

    @CsvBindByName(column = "phone_number")
    @Size(max = 30, message = "Phone number must not exceed 30 characters")
    private String phoneNumber;

    @CsvBindByName(column = "personal_email")
    @Email(message = "Invalid personal email format")
    @Size(max = 255, message = "Personal email must not exceed 255 characters")
    private String personalEmail;

    // ==================== Employment Details ====================

    @CsvBindByName(column = "department_code")
    @Size(max = 50, message = "Department code must not exceed 50 characters")
    private String departmentCode;

    @CsvBindByName(column = "position_code")
    @Size(max = 50, message = "Position code must not exceed 50 characters")
    private String positionCode;

    @CsvBindByName(column = "designation")
    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @CsvBindByName(column = "employment_type")
    @Size(max = 30, message = "Employment type must not exceed 30 characters")
    private String employmentType; // full_time, part_time, contract, intern

    @CsvBindByName(column = "employment_status")
    @Size(max = 30, message = "Employment status must not exceed 30 characters")
    private String employmentStatus; // active, probation, on_leave, notice_period, resigned, terminated

    @CsvBindByName(column = "hire_date")
    @CsvDate(value = "yyyy-MM-dd")
    private LocalDate hireDate;

    @CsvBindByName(column = "start_date")
    @CsvDate(value = "yyyy-MM-dd")
    private LocalDate startDate;

    @CsvBindByName(column = "probation_end_date")
    @CsvDate(value = "yyyy-MM-dd")
    private LocalDate probationEndDate;

    @CsvBindByName(column = "reports_to_code")
    @Size(max = 50, message = "Reports to code must not exceed 50 characters")
    private String reportsToCode;

    // ==================== Compensation ====================

    @CsvBindByName(column = "salary")
    @DecimalMin(value = "0.00", message = "Salary cannot be negative")
    private String salary;

    @CsvBindByName(column = "pay_frequency")
    @Size(max = 20, message = "Pay frequency must not exceed 20 characters")
    private String payFrequency; // monthly, bi_weekly, weekly

    @CsvBindByName(column = "currency")
    @Size(max = 10, message = "Currency must not exceed 10 characters")
    private String currency;

    // ==================== Address ====================

    @CsvBindByName(column = "address_line1")
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String addressLine1;

    @CsvBindByName(column = "address_line2")
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String addressLine2;

    @CsvBindByName(column = "city")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @CsvBindByName(column = "state")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @CsvBindByName(column = "country")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @CsvBindByName(column = "country_code")
    @Size(max = 3, message = "Country code must not exceed 3 characters")
    private String countryCode;

    @CsvBindByName(column = "postal_code")
    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    // ==================== Work Location ====================

    @CsvBindByName(column = "work_location")
    @Size(max = 100, message = "Work location must not exceed 100 characters")
    private String workLocation;

    @CsvBindByName(column = "work_mode")
    @Size(max = 30, message = "Work mode must not exceed 30 characters")
    private String workMode; // on_site, remote, hybrid

    // ==================== Getters and Setters ====================

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getPreferredName() { return preferredName; }
    public void setPreferredName(String preferredName) { this.preferredName = preferredName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPersonalEmail() { return personalEmail; }
    public void setPersonalEmail(String personalEmail) { this.personalEmail = personalEmail; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getPositionCode() { return positionCode; }
    public void setPositionCode(String positionCode) { this.positionCode = positionCode; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getProbationEndDate() { return probationEndDate; }
    public void setProbationEndDate(LocalDate probationEndDate) { this.probationEndDate = probationEndDate; }

    public String getReportsToCode() { return reportsToCode; }
    public void setReportsToCode(String reportsToCode) { this.reportsToCode = reportsToCode; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getPayFrequency() { return payFrequency; }
    public void setPayFrequency(String payFrequency) { this.payFrequency = payFrequency; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
}

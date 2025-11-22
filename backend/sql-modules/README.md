# HRMS SQL Modules

This directory contains modular SQL schema files organized by functionality.

## Module Structure

| Module | File | Description |
|--------|------|-------------|
| Employee Core | `01_employee_core.sql` | Slim employee table with essential fields |
| Employee Addresses | `02_employee_addresses.sql` | Multiple addresses per employee |
| Emergency Contacts | `03_employee_emergency_contacts.sql` | Multiple emergency contacts |
| Identity Documents | `04_employee_identity_documents.sql` | **Country-agnostic** ID storage (SSN, PAN, NI, TFN, etc.) |
| Bank Accounts | `05_employee_bank_accounts.sql` | Multiple bank accounts, international support |
| Tax Information | `06_employee_tax_info.sql` | Country-specific tax details |
| Onboarding | `07_employee_onboarding.sql` | Onboarding progress tracking |

## Key Design Principles

### 1. Country-Agnostic Design
Instead of hardcoding country-specific fields like `pan_number` or `ssn`, we use:
- `identity_document_types` - Reference table with all document types globally
- `employee_identity_documents` - Flexible storage for any country's ID

### 2. Clear Field Categorization
Each field is marked with its requirement level:
- `[REQUIRED_ONBOARDING]` - Must be filled to create employee
- `[REQUIRED_WEEK1]` - Must be completed within first week
- `[REQUIRED_PAYROLL]` - Must be completed before first payroll
- `[OPTIONAL]` - Can be filled anytime
- `[SYSTEM]` - Auto-generated

### 3. Onboarding Flow
```
STEP 1: Basic Info (blocks creation if incomplete)
├── First Name, Last Name
├── Work Email
├── Joining Date
└── Department, Position

STEP 2: Personal Details (within first week)
├── Date of Birth
├── Phone Number
├── Personal Email
└── Nationality

STEP 3: Address & Emergency Contact
├── Current Address
└── At least 1 Emergency Contact

STEP 4: Identity Documents (within 30 days)
├── Tax ID (country-specific)
├── Government ID
└── Work Authorization (if applicable)

STEP 5: Bank & Tax (before first payroll)
├── Bank Account
└── Tax Information

STEP 6: Additional Info (optional)
├── Skills, Certifications
├── Social Profiles
└── Preferences
```

## Supported Countries (Identity Documents)

| Country | Tax ID | National ID | Work Auth |
|---------|--------|-------------|-----------|
| USA | SSN, ITIN | - | EAD, Green Card |
| India | PAN, UAN | Aadhaar, Voter ID | - |
| UK | NI Number | - | BRP |
| Canada | SIN | - | PR Card |
| Australia | TFN, ABN | - | - |
| Germany | Steuer-ID | Sozialversicherungsnummer | - |
| Universal | - | Passport | Work Visa, Permit |

## Usage

These modules are incorporated into the main `schema.sql` file.
For new installations, run `schema.sql` directly.

## Adding a New Country

1. Add new document types to `identity_document_types` table
2. Add country-specific fields to `employee_tax_info` if needed
3. Update UI to show relevant fields based on country

## Security Notes

- All sensitive fields (document numbers, bank accounts) should be encrypted in production
- Masked fields (`*_masked`) store redacted versions for display
- Access to sensitive data should be role-based

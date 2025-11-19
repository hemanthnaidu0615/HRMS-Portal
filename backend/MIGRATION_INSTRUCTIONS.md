# Database Migration Instructions

## Issue
The application failed to start because the `employees` table is missing three columns that exist in the Employee entity:
- `client_name`
- `project_id_string`
- `contract_start_date`

## Solution
Run the migration script to add these missing columns to your database.

## Steps to Run Migration

### Option 1: Using SQL Server Management Studio (SSMS)
1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Open the file: `add_missing_employee_columns.sql`
4. Execute the script (F5)
5. Verify the columns were added successfully by checking the output messages

### Option 2: Using sqlcmd Command Line
```bash
sqlcmd -S your_server_name -d HRMS -U your_username -P your_password -i add_missing_employee_columns.sql
```

Replace:
- `your_server_name` with your SQL Server instance name
- `your_username` with your database username
- `your_password` with your database password

### Option 3: Using Azure Data Studio
1. Open Azure Data Studio
2. Connect to your SQL Server instance
3. Open the file: `add_missing_employee_columns.sql`
4. Click "Run" to execute the script
5. Check the Messages pane for success confirmation

## Verification
After running the migration, verify the columns exist:
```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'employees'
AND COLUMN_NAME IN ('client_name', 'project_id_string', 'contract_start_date')
ORDER BY COLUMN_NAME;
```

You should see all three columns listed.

## After Migration
Once the migration is complete, restart your Spring Boot application:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

The application should now start successfully without the column mismatch errors.

## Files Modified
- `schema.sql` - Updated to include the missing columns for future deployments
- `add_missing_employee_columns.sql` - Migration script to add columns to existing database

# Database Migrations

This directory contains SQL migration scripts to update existing databases with schema changes.

## How to Apply Migrations

### Option 1: Run Migration Script Directly (Recommended for Quick Fix)

Connect to your SQL Server database and run the migration script:

```sql
-- Connect to your database first
USE your_database_name;
GO

-- Then run the migration script
-- Execute the content of: add_missing_columns_to_employees.sql
```

### Option 2: Use SQL Server Management Studio (SSMS)

1. Open SQL Server Management Studio
2. Connect to your database server
3. Open the migration script file
4. Select the target database from the dropdown
5. Click Execute

### Option 3: Use Command Line

```bash
sqlcmd -S your_server -d your_database -i migrations/add_missing_columns_to_employees.sql
```

## Preventing Future Schema Issues

### Important: Schema.sql is the Source of Truth

The `schema.sql` file in the backend root directory is the authoritative schema definition. When you encounter schema errors:

1. **Check schema.sql** - Ensure it has all required columns matching the entity classes
2. **Apply migrations** - Use migration scripts to update existing databases
3. **Fresh installations** - For new databases, run the complete `schema.sql`

### Best Practices

1. **Always update schema.sql** when adding new fields to entities
2. **Create migration scripts** for each schema change to update existing databases
3. **Test with demo profile** after schema changes:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=demo
   ```
4. **Consider database migration tools** like Flyway or Liquibase for automatic versioning

### For Development Environments

If you're working in a development environment and don't have important data:

1. Drop the database
2. Recreate it
3. Run `schema.sql` to create all tables
4. Start the application with demo profile to load sample data

### Current Migration

**Date**: 2025-11-19
**Script**: add_missing_columns_to_employees.sql
**Changes**:
- Added `deleted_by UNIQUEIDENTIFIER` column to employees table
- Added `github_profile VARCHAR(255)` column to employees table

These columns were missing from the database schema but are required by the Employee entity class.

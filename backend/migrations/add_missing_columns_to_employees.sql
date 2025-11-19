-- =====================================================
-- Migration Script: Add Missing Columns to Employees Table
-- Date: 2025-11-19
-- Description: Adds deleted_by and github_profile columns to employees table
-- =====================================================

-- Check if the deleted_by column exists before adding it
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'deleted_by'
)
BEGIN
    ALTER TABLE employees ADD deleted_by UNIQUEIDENTIFIER;
    PRINT 'Added deleted_by column to employees table';
END
ELSE
BEGIN
    PRINT 'deleted_by column already exists in employees table';
END;

-- Check if the github_profile column exists before adding it
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'github_profile'
)
BEGIN
    ALTER TABLE employees ADD github_profile VARCHAR(255);
    PRINT 'Added github_profile column to employees table';
END
ELSE
BEGIN
    PRINT 'github_profile column already exists in employees table';
END;

PRINT 'Migration completed successfully';

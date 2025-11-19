-- Migration to add missing alternate_emergency_contact_relationship column
-- Run this script to fix the database schema mismatch

USE HRMS;
GO

-- Check if column already exists before adding it
IF NOT EXISTS (
    SELECT *
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'alternate_emergency_contact_relationship'
)
BEGIN
    ALTER TABLE employees
    ADD alternate_emergency_contact_relationship VARCHAR(100) NULL;

    PRINT 'Column alternate_emergency_contact_relationship added successfully';
END
ELSE
BEGIN
    PRINT 'Column alternate_emergency_contact_relationship already exists';
END
GO

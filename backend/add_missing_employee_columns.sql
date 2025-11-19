-- Migration to add missing employee columns
-- Run this script to fix the database schema mismatch

USE HRMS;
GO

-- Add client_name column
IF NOT EXISTS (
    SELECT *
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'client_name'
)
BEGIN
    ALTER TABLE employees
    ADD client_name VARCHAR(255) NULL;

    PRINT 'Column client_name added successfully';
END
ELSE
BEGIN
    PRINT 'Column client_name already exists';
END
GO

-- Add project_id_string column
IF NOT EXISTS (
    SELECT *
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'project_id_string'
)
BEGIN
    ALTER TABLE employees
    ADD project_id_string VARCHAR(255) NULL;

    PRINT 'Column project_id_string added successfully';
END
ELSE
BEGIN
    PRINT 'Column project_id_string already exists';
END
GO

-- Add contract_start_date column
IF NOT EXISTS (
    SELECT *
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'contract_start_date'
)
BEGIN
    ALTER TABLE employees
    ADD contract_start_date DATE NULL;

    PRINT 'Column contract_start_date added successfully';
END
ELSE
BEGIN
    PRINT 'Column contract_start_date already exists';
END
GO

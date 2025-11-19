-- Migration script to fix the 'enabled' column issue in users table
-- This script renames the 'enabled' column to 'is_active' if it exists
-- Run this script on your SQL Server database before starting the application

-- Check if 'enabled' column exists and rename it to 'is_active'
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users'
    AND COLUMN_NAME = 'enabled'
)
BEGIN
    PRINT 'Renaming column "enabled" to "is_active" in users table...';
    EXEC sp_rename 'users.enabled', 'is_active', 'COLUMN';
    PRINT 'Column renamed successfully.';

    -- Ensure the column is NOT NULL
    PRINT 'Ensuring column is NOT NULL...';
    ALTER TABLE users ALTER COLUMN is_active BIT NOT NULL;
    PRINT 'Column constraints updated.';
END
ELSE IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_active'
)
BEGIN
    PRINT 'Column "is_active" already exists in users table.';

    -- Ensure the column is NOT NULL
    DECLARE @IsNullable NVARCHAR(3);
    SELECT @IsNullable = IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_active';

    IF @IsNullable = 'YES'
    BEGIN
        PRINT 'Updating column to NOT NULL...';
        -- First set any NULL values to default
        UPDATE users SET is_active = 1 WHERE is_active IS NULL;
        -- Then alter column to NOT NULL
        ALTER TABLE users ALTER COLUMN is_active BIT NOT NULL;
        PRINT 'Column constraints updated.';
    END
    ELSE
    BEGIN
        PRINT 'Column already has correct constraints. No action needed.';
    END
END
ELSE
BEGIN
    PRINT 'Adding column "is_active" to users table...';
    ALTER TABLE users ADD is_active BIT NOT NULL DEFAULT 1;
    PRINT 'Column added successfully.';
END
GO

-- Verify the column exists
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_active'
)
BEGIN
    PRINT 'Verification successful: Column "is_active" exists in users table.';
END
ELSE
BEGIN
    PRINT 'ERROR: Column "is_active" does not exist in users table!';
END
GO

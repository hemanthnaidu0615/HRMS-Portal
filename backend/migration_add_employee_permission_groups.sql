-- =====================================================
-- MIGRATION: Add employee_permission_groups table
-- This table is needed for the many-to-many relationship
-- between employees and permission groups
-- =====================================================

-- Create the employee_permission_groups table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'employee_permission_groups')
BEGIN
    CREATE TABLE employee_permission_groups (
        employee_id UNIQUEIDENTIFIER NOT NULL,
        group_id UNIQUEIDENTIFIER NOT NULL,
        PRIMARY KEY (employee_id, group_id),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES permission_groups(id) ON DELETE CASCADE
    );

    -- Create indexes for performance
    CREATE INDEX idx_employee_permission_groups_employee ON employee_permission_groups(employee_id);
    CREATE INDEX idx_employee_permission_groups_group ON employee_permission_groups(group_id);

    PRINT 'Successfully created employee_permission_groups table and indexes';
END
ELSE
BEGIN
    PRINT 'Table employee_permission_groups already exists, skipping creation';
END
GO

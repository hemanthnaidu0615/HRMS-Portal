IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'chk_el_status')
BEGIN
    ALTER TABLE email_logs DROP CONSTRAINT chk_el_status;
END
GO

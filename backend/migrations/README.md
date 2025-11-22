# Database Migrations

This directory contains SQL migration scripts for updating existing databases with schema changes.

> **Note**: The main `schema.sql` file in the backend root is the single source of truth for the complete database schema.

## For New Installations

Simply run `schema.sql` - it contains the complete, up-to-date schema.

## For Existing Databases

If you need to apply incremental changes to an existing database:

1. Create a migration script in this folder
2. Name it with date prefix: `YYYY-MM-DD_description.sql`
3. Use idempotent statements (IF NOT EXISTS checks)
4. Apply using SSMS or sqlcmd

## Best Practices

1. **schema.sql is authoritative** - Always keep it updated
2. **Test changes** before applying to production
3. **Backup database** before running migrations
4. Consider using Flyway/Liquibase for automated versioning

-- Add fulfilled_document_id column to document_requests table
-- Note: SQL Server does not use the COLUMN keyword in ALTER TABLE ADD
ALTER TABLE document_requests
ADD fulfilled_document_id UNIQUEIDENTIFIER NULL;

-- Add foreign key constraint
ALTER TABLE document_requests
ADD CONSTRAINT FK_document_requests_fulfilled_document
FOREIGN KEY (fulfilled_document_id) REFERENCES documents(id);

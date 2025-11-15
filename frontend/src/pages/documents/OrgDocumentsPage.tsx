import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getOrganizationDocuments } from '../../api/documentsApi';

interface Document {
  id: string;
  employeeId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  createdAt: string;
}

export const OrgDocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getOrganizationDocuments();
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const actionBodyTemplate = (rowData: Document) => {
    return (
      <Button
        label="Upload for Employee"
        size="small"
        onClick={() => navigate(`/documents/employee/${rowData.employeeId}/upload`)}
      />
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Organization Documents</h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <DataTable
          value={documents}
          loading={loading}
          emptyMessage="No documents found"
          className="p-datatable-sm"
        >
          <Column field="employeeId" header="Employee ID" sortable />
          <Column field="fileName" header="File Name" sortable />
          <Column field="fileType" header="File Type" />
          <Column field="filePath" header="File Path" />
          <Column
            field="createdAt"
            header="Created Date"
            sortable
            body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
          />
          <Column header="Actions" body={actionBodyTemplate} />
        </DataTable>
      </div>
    </div>
  );
};

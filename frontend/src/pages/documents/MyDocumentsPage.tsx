import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getMyDocuments } from '../../api/documentsApi';

interface Document {
  id: string;
  fileName: string;
  uploadedByUserId: string;
  createdAt: string;
}

export const MyDocumentsPage = () => {
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
      const response = await getMyDocuments();
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <Button
            label="Upload New Document"
            icon="pi pi-upload"
            onClick={() => navigate('/documents/upload')}
          />
        </div>

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
          <Column field="fileName" header="File Name" sortable />
          <Column field="uploadedByUserId" header="Uploaded By" />
          <Column
            field="createdAt"
            header="Created Date"
            sortable
            body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
          />
        </DataTable>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getMyDocumentRequestsAsTarget } from '../../api/documentRequestsApi';

interface DocumentRequest {
  id: string;
  requesterUserId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export const MyIncomingRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyDocumentRequestsAsTarget();
      setRequests(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const statusBodyTemplate = (rowData: DocumentRequest) => {
    const statusColors: { [key: string]: string } = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[rowData.status] || 'bg-gray-100 text-gray-800'}`}>
        {rowData.status}
      </span>
    );
  };

  const actionBodyTemplate = (rowData: DocumentRequest) => {
    if (rowData.status !== 'REQUESTED') {
      return <span className="text-sm text-gray-500">-</span>;
    }

    return (
      <Button
        label="Upload Document"
        size="small"
        onClick={() => navigate('/documents/upload')}
      />
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Incoming Document Requests</h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <DataTable
          value={requests}
          loading={loading}
          emptyMessage="No incoming requests found"
          className="p-datatable-sm"
        >
          <Column field="requesterUserId" header="Requester" />
          <Column field="message" header="Message" />
          <Column header="Status" body={statusBodyTemplate} />
          <Column
            field="createdAt"
            header="Created At"
            sortable
            body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
          />
          <Column
            field="completedAt"
            header="Completed At"
            body={(rowData) => rowData.completedAt ? new Date(rowData.completedAt).toLocaleString() : '-'}
          />
          <Column header="Actions" body={actionBodyTemplate} />
        </DataTable>
      </div>
    </div>
  );
};

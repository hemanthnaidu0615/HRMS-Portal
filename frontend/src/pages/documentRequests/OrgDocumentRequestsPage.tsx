import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { getOrgDocumentRequests, updateDocumentRequestStatus, createDocumentRequest } from '../../api/documentRequestsApi';
import { orgadminApi, Employee } from '../../api/orgadminApi';

interface DocumentRequest {
  id: string;
  requesterUserId: string;
  targetEmployeeId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export const OrgDocumentRequestsPage = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [requestMessage, setRequestMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadRequests();
    loadEmployees();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getOrgDocumentRequests();
      setRequests(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await orgadminApi.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      // Keep page usable even if employees fail to load
      setCreateError(err.response?.data?.error || 'Failed to load employees for requests');
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedEmployeeId || !requestMessage.trim()) {
      setCreateError('Please select an employee and enter a message');
      return;
    }

    try {
      setCreateError('');
      setCreateLoading(true);
      await createDocumentRequest(selectedEmployeeId, requestMessage.trim());
      setRequestMessage('');
      setSelectedEmployeeId('');
      await loadRequests();
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      setActionLoading(requestId);
      await updateDocumentRequestStatus(requestId, status);
      await loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
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
      <div className="flex gap-2">
        <Button
          label="Approve"
          size="small"
          severity="success"
          loading={actionLoading === rowData.id}
          disabled={actionLoading !== null}
          onClick={() => handleStatusUpdate(rowData.id, 'COMPLETED')}
        />
        <Button
          label="Reject"
          size="small"
          severity="danger"
          loading={actionLoading === rowData.id}
          disabled={actionLoading !== null}
          onClick={() => handleStatusUpdate(rowData.id, 'REJECTED')}
        />
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Organization Document Requests</h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6 border border-gray-200 rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Request Document from Employee</h2>
          {createError && (
            <div className="p-3 mb-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {createError}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Employee</label>
              <Dropdown
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.value)}
                options={employees}
                optionLabel="email"
                optionValue="employeeId"
                placeholder="Select employee"
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Message</label>
              <InputText
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="e.g. Please upload your ID proof"
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button
                label="Request Document"
                onClick={handleCreateRequest}
                loading={createLoading}
                disabled={createLoading || !employees.length}
              />
            </div>
          </div>
        </div>

        <DataTable
          value={requests}
          loading={loading}
          emptyMessage="No requests found"
          className="p-datatable-sm"
        >
          <Column field="requesterUserId" header="Requester" />
          <Column field="targetEmployeeId" header="Target Employee" />
          <Column field="message" header="Message" />
          <Column header="Status" body={statusBodyTemplate} />
          <Column
            field="createdAt"
            header="Created At"
            sortable
            body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
          />
          <Column header="Actions" body={actionBodyTemplate} />
        </DataTable>
      </div>
    </div>
  );
};

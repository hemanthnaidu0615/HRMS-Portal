import http from './http';

export async function createDocumentRequest(targetEmployeeId: string, message: string) {
  const res = await http.post('/api/document-requests', { targetEmployeeId, message });
  return res.data;
}

export async function getMyDocumentRequestsAsTarget() {
  const res = await http.get('/api/document-requests/me');
  return res.data;
}

export async function getMyDocumentRequestsAsRequester() {
  const res = await http.get('/api/document-requests/my-requests');
  return res.data;
}

export async function getOrgDocumentRequests() {
  const res = await http.get('/api/document-requests/org');
  return res.data;
}

export async function updateDocumentRequestStatus(requestId: string, status: string) {
  const res = await http.patch(`/api/document-requests/${requestId}/status`, { status });
  return res.data;
}

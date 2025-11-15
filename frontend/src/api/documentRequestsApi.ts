import http from './http';

export async function createDocumentRequest(targetEmployeeId: string, message: string) {
  return http.post('/api/document-requests', { targetEmployeeId, message });
}

export async function getMyDocumentRequestsAsTarget() {
  return http.get('/api/document-requests/me');
}

export async function getMyDocumentRequestsAsRequester() {
  return http.get('/api/document-requests/my-requests');
}

export async function getOrgDocumentRequests() {
  return http.get('/api/document-requests/org');
}

export async function updateDocumentRequestStatus(requestId: string, status: string) {
  return http.patch(`/api/document-requests/${requestId}/status`, { status });
}

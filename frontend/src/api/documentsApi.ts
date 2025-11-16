import http from './http';

export async function uploadMyDocument(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await http.post('/api/documents/me/upload', form);
  return res.data;
}

export async function uploadMyDocumentForRequest(requestId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await http.post('/api/documents/me/upload', form, { params: { requestId } });
  return res.data;
}

export async function uploadEmployeeDocument(employeeId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await http.post(`/api/documents/employee/${employeeId}/upload`, form);
  return res.data;
}

export async function uploadEmployeeDocumentForRequest(employeeId: string, requestId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await http.post(`/api/documents/employee/${employeeId}/upload`, form, { params: { requestId } });
  return res.data;
}

export async function getMyDocuments() {
  const res = await http.get('/api/documents/me');
  return res.data;
}

export async function getEmployeeDocuments(employeeId: string) {
  const res = await http.get(`/api/documents/employee/${employeeId}`);
  return res.data;
}

export async function getOrganizationDocuments() {
  const res = await http.get('/api/documents/org');
  return res.data;
}

export async function downloadDocument(documentId: string) {
  const timestamp = new Date().getTime();
  const res = await http.get(`/api/documents/${documentId}/download?t=${timestamp}`, {
    responseType: 'blob',
  });
  return res;
}

export async function getDownloadUrl(documentId: string) {
  const timestamp = new Date().getTime();
  const token = localStorage.getItem('token');
  return `${http.defaults.baseURL}/api/documents/${documentId}/download?t=${timestamp}&token=${token}`;
}

import http from './http';

export async function uploadMyDocument(file: File) {
  const form = new FormData();
  form.append('file', file);
  return http.post('/api/documents/me/upload', form);
}

export async function uploadEmployeeDocument(employeeId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return http.post(`/api/documents/employee/${employeeId}/upload`, form);
}

export async function getMyDocuments() {
  return http.get('/api/documents/me');
}

export async function getEmployeeDocuments(employeeId: string) {
  return http.get(`/api/documents/employee/${employeeId}`);
}

export async function getOrganizationDocuments() {
  return http.get('/api/documents/org');
}

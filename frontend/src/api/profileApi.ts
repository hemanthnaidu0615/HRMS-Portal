import http from './http';

export interface UserProfile {
  id: string;
  email: string;
  organizationId: string | null;
  organizationName: string | null;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function getMyProfile() {
  const res = await http.get<UserProfile>('/api/profile/me');
  return res.data;
}

export async function changePassword(data: ChangePasswordRequest) {
  const res = await http.post('/api/profile/change-password', data);
  return res.data;
}

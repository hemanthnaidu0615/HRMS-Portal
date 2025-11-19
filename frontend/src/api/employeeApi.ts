// Employee API
// Simple wrapper for employee search functionality

import http from './http';

export const searchEmployees = async (query: string) => {
  try {
    const response = await http.get('/api/employees/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search employees:', error);
    return [];
  }
};

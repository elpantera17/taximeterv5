// Servicio para interactuar con la API de backend en PHP
// Este archivo centraliza todas las llamadas a la API

// URL base de la API (ya incluye /taximeter)
const API_BASE_URL = '/taximeter/api';

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  return localStorage.getItem('pantera_token');
};

// Función genérica para hacer peticiones a la API
async function fetchApi(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<any> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (requiresAuth) {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
}

// Funciones específicas para diferentes endpoints
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi('/auth/login', 'POST', { email, password }, false),

  register: (userData: any) =>
    fetchApi('/auth/register', 'POST', userData, false),

  logout: () =>
    fetchApi('/auth/logout', 'POST'),

  getCurrentUser: () =>
    fetchApi('/auth/me', 'GET'),

  updateProfile: (userId: string, data: any) =>
    fetchApi(`/users/${userId}`, 'PUT', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    fetchApi('/auth/change-password', 'POST', { currentPassword, newPassword })
};

export const tripsApi = {
  getAll: () =>
    fetchApi('/trips'),

  getById: (tripId: string) =>
    fetchApi(`/trips/${tripId}`),

  create: (tripData: any) =>
    fetchApi('/trips', 'POST', tripData),

  update: (tripId: string, tripData: any) =>
    fetchApi(`/trips/${tripId}`, 'PUT', tripData),

  delete: (tripId: string) =>
    fetchApi(`/trips/${tripId}`, 'DELETE')
};

export const fareApi = {
  getAll: () =>
    fetchApi('/fares'),

  getById: (fareId: string) =>
    fetchApi(`/fares/${fareId}`),

  create: (fareData: any) =>
    fetchApi('/fares', 'POST', fareData),

  update: (fareId: string, fareData: any) =>
    fetchApi(`/fares/${fareId}`, 'PUT', fareData),

  delete: (fareId: string) =>
    fetchApi(`/fares/${fareId}`, 'DELETE')
};

export const workGroupApi = {
  getAll: () =>
    fetchApi('/workgroups'),

  getById: (groupId: string) =>
    fetchApi(`/workgroups/${groupId}`),

  create: (groupData: any) =>
    fetchApi('/workgroups', 'POST', groupData),

  update: (groupId: string, groupData: any) =>
    fetchApi(`/workgroups/${groupId}`, 'PUT', groupData),

  delete: (groupId: string) =>
    fetchApi(`/workgroups/${groupId}`, 'DELETE'),

  getMembers: (groupId: string) =>
    fetchApi(`/workgroups/${groupId}/members`),

  addMember: (groupId: string, memberData: any) =>
    fetchApi(`/workgroups/${groupId}/members`, 'POST', memberData),

  removeMember: (groupId: string, memberId: string) =>
    fetchApi(`/workgroups/${groupId}/members/${memberId}`, 'DELETE')
};

// Exportar todas las APIs
export default {
  auth: authApi,
  trips: tripsApi,
  fares: fareApi,
  workGroups: workGroupApi
};

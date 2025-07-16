// Servicio para interactuar con la API de backend en PHP
// Este archivo centraliza todas las llamadas a la API

// URL base de la API (adaptado al subdirectorio /taximeter/api)
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
      'Content-Type': 'application/json',
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
      credentials: 'include',
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

export default fetchApi;

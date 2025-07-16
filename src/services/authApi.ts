// Servicio para autenticación de usuarios
import fetchApi from './fetchApi'; // Asegúrate de tener este archivo creado también

export const authApi = {
  // Iniciar sesión
  login: (email: string, password: string) =>
    fetchApi('/taximeter/api/auth/login.php', 'POST', { email, password }, false),

  // Registro de usuario (si existe el endpoint)
  register: (userData: any) =>
    fetchApi('/taximeter/api/auth/register.php', 'POST', userData, false),

  // Obtener datos del usuario actual (debes tener este endpoint PHP)
  getCurrentUser: () =>
    fetchApi('/taximeter/api/auth/me.php', 'GET'),

  // Cerrar sesión (si lo implementas)
  logout: () =>
    fetchApi('/taximeter/api/auth/logout.php', 'POST'),

  // Actualizar perfil (si tienes este endpoint)
  updateProfile: (userId: string, data: any) =>
    fetchApi(`/taximeter/api/users/${userId}.php`, 'PUT', data),

  // Cambiar contraseña (si lo implementas)
  changePassword: (currentPassword: string, newPassword: string) =>
    fetchApi('/taximeter/api/auth/change-password.php', 'POST', { currentPassword, newPassword })
};

export default authApi;

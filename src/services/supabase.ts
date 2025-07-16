// Adaptación para MySQL en Hostinger
// Este archivo simula la API de Supabase pero usa MySQL en Hostinger

// Configuración para MySQL en Hostinger - ACTUALIZAR CON TUS CREDENCIALES
export const hostingerConfig = {
  host: 'localhost',
  database: 'u379683784_Meter',
  user: 'u379683784_Meter',
  password: 'Sofia24@123'
};

// Simulación del cliente de Supabase
export const supabase = {
  auth: {
    getUser: async () => {
      // Obtener usuario del localStorage
      const user = localStorage.getItem('pantera_user');
      return { data: { user: user ? JSON.parse(user) : null }, error: null };
    },
    
    signUp: async ({ email, password, options }: any) => {
      try {
        // Simular registro con fetch a API
        const response = await fetch('/taximeter/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName: options?.data?.first_name,
            lastName: options?.data?.last_name,
            phone: options?.data?.phone
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          return { error: { message: data.message || 'Error al registrar usuario' } };
        }
        
        return { data: { user: data.user }, error: null };
      } catch (error) {
        console.error('Error en registro:', error);
        return { error: { message: 'Error de conexión' } };
      }
    },
    
    signInWithPassword: async ({ email, password }: any) => {
      try {
        // Simular login con fetch a API
        const response = await fetch('/taximeter/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          return { error: { message: data.message || 'Credenciales inválidas' } };
        }
        
        // Guardar usuario en localStorage
        localStorage.setItem('pantera_user', JSON.stringify(data.user));
        localStorage.setItem('pantera_token', data.token);
        
        return { data: { user: data.user, session: { access_token: data.token } }, error: null };
      } catch (error) {
        console.error('Error en login:', error);
        return { error: { message: 'Error de conexión' } };
      }
    },
    
    signOut: async () => {
      // Eliminar datos de sesión
      localStorage.removeItem('pantera_user');
      localStorage.removeItem('pantera_token');
      return { error: null };
    },
    
    onAuthStateChange: (callback: any) => {
      // Simular evento de cambio de autenticación
      const handler = () => {
        const user = localStorage.getItem('pantera_user');
        const event = user ? 'SIGNED_IN' : 'SIGNED_OUT';
        const session = user ? { user: JSON.parse(user) } : null;
        callback(event, session);
      };
      
      // Ejecutar handler inmediatamente
      handler();
      
      // Devolver objeto de suscripción simulado
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    
    updateUser: async ({ password }: any) => {
      try {
        // Simular cambio de contraseña con fetch a API
        const token = localStorage.getItem('pantera_token');
        const response = await fetch('/taximeter/api/auth/update-password', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          return { error: { message: data.message || 'Error al actualizar contraseña' } };
        }
        
        return { data: {}, error: null };
      } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return { error: { message: 'Error de conexión' } };
      }
    }
  },
  
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: async (column: string, value: any) => {
            try {
              // Simular consulta con fetch a API
              const token = localStorage.getItem('pantera_token');
              const response = await fetch(`/taximeter/api/data/${table}?column=${column}&value=${value}&select=${columns}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              const data = await response.json();
              
              if (!data.success) {
                return { data: null, error: { message: data.message } };
              }
              
              return { data: data.data, error: null };
            } catch (error) {
              console.error(`Error en consulta a ${table}:`, error);
              return { data: null, error: { message: 'Error de conexión' } };
            }
          },
          limit: (limit: number) => {
            return {
              maybeSingle: async () => {
                try {
                  // Simular consulta con fetch a API
                  const token = localStorage.getItem('pantera_token');
                  const response = await fetch(`/taximeter/api/data/${table}?limit=${limit}&select=${columns}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  
                  const data = await response.json();
                  
                  if (!data.success) {
                    return { data: null, error: { message: data.message } };
                  }
                  
                  return { data: data.data.length > 0 ? data.data[0] : null, error: null };
                } catch (error) {
                  console.error(`Error en consulta a ${table}:`, error);
                  return { data: null, error: { message: 'Error de conexión' } };
                }
              }
            };
          }
        };
      },
      insert: async (values: any) => {
        try {
          // Simular inserción con fetch a API
          const token = localStorage.getItem('pantera_token');
          const response = await fetch(`/taximeter/api/data/${table}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(values)
          });
          
          const data = await response.json();
          
          if (!data.success) {
            return { data: null, error: { message: data.message } };
          }
          
          return { data: data.data, error: null };
        } catch (error) {
          console.error(`Error en inserción a ${table}:`, error);
          return { data: null, error: { message: 'Error de conexión' } };
        }
      },
      update: async (values: any) => {
        return {
          eq: async (column: string, value: any) => {
            try {
              // Simular actualización con fetch a API
              const token = localStorage.getItem('pantera_token');
              const response = await fetch(`/taximeter/api/data/${table}?column=${column}&value=${value}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values)
              });
              
              const data = await response.json();
              
              if (!data.success) {
                return { data: null, error: { message: data.message } };
              }
              
              return { data: data.data, error: null };
            } catch (error) {
              console.error(`Error en actualización a ${table}:`, error);
              return { data: null, error: { message: 'Error de conexión' } };
            }
          }
        };
      }
    };
  }
};

// Función para obtener el usuario actual
export async function getCurrentUser() {
  try {
    // Obtener usuario del localStorage
    const userJson = localStorage.getItem('pantera_user');
    if (!userJson) return null;

    const user = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Función para iniciar sesión
export async function signIn(identifier: string, password: string) {
  try {
    // Simular login con Hostinger
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password
    });
    
    if (error) return { error };
    if (!data.user) return { error: { message: 'Usuario no encontrado' } };
    
    return { user: data.user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { error: { message: 'Error inesperado al iniciar sesión' } };
  }
}

// Función para registrar un nuevo usuario
export async function signUp(userData: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
}) {
  try {
    // Registrar usuario
    const { data, error } = await supabase.auth.signUp({
      email: userData.email || `${userData.phone.replace(/[^0-9]/g, '')}@pantera.local`,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone
        }
      }
    });

    if (error) return { error };
    if (!data.user) return { error: { message: 'Error al crear el usuario' } };

    return { user: await getCurrentUser() };
  } catch (error) {
    console.error('Error signing up:', error);
    return { error: { message: 'Error inesperado al registrar usuario' } };
  }
}

// Función para cerrar sesión
export async function signOut() {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

// Función para verificar si el teléfono ya existe
export async function checkPhoneExists(phone: string) {
  try {
    // Simular verificación con API
    const response = await fetch(`/taximeter/api/check-phone?phone=${encodeURIComponent(phone)}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking phone:', error);
    return false;
  }
}

// Función para actualizar datos del usuario
export async function updateUserProfile(userId: string, userData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
  }
}) {
  try {
    // Simular actualización con API
    const token = localStorage.getItem('pantera_token');
    const response = await fetch(`/taximeter/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!data.success) return { error: { message: data.message } };

    // Actualizar usuario en localStorage
    const userJson = localStorage.getItem('pantera_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('pantera_user', JSON.stringify(updatedUser));
    }

    return { user: await getCurrentUser() };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
}

// Función para cambiar la contraseña
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    // Simular cambio de contraseña con API
    const token = localStorage.getItem('pantera_token');
    const response = await fetch('/taximeter/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();
    if (!data.success) return { error: { message: data.message } };

    // Actualizar token si es necesario
    if (data.token) {
      localStorage.setItem('pantera_token', data.token);
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { error: { message: 'Error al cambiar la contraseña' } };
  }
}

// Función para crear un usuario de prueba (solo para desarrollo)
async function createTestUser() {
  try {
    // Intentar iniciar sesión con credenciales de administrador
    const loginResult = await signIn('p.joselopez19@gmail.com', 'Sofia24@123');
    return loginResult.user ? { user: loginResult.user } : { error: { message: 'No se pudo iniciar sesión con el usuario administrador' } };
  } catch (error) {
    console.error('Error creating test user:', error);
    return { error: { message: 'Error al crear usuario de prueba' } };
  }
}

// Función para actualizar usuario en auth
export async function updateUserAuth(userId: string, userData: {
  email?: string;
  password?: string;
  data?: any;
}) {
  try {
    // Simular actualización con API
    const token = localStorage.getItem('pantera_token');
    const response = await fetch(`/taximeter/api/auth/update-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: userData.email,
      password: newPassword
      })
    });

    const data = await response.json();
    if (!data.success) return { error: { message: data.message } };

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error updating user auth:', error);
    return { error: { message: 'Error al actualizar usuario' } };
  }
}

// Función para verificar si un usuario puede registrarse
export async function canRegisterUser(phone: string, email?: string) {
  try {
    // Simular verificación con API
    const params = new URLSearchParams();
    params.append('phone', phone);
    if (email) params.append('email', email);
    
    const response = await fetch(`/taximeter/api/can-register?${params.toString()}`);
    const data = await response.json();
    
    return data.canRegister;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
}

// Exportar la función para uso externo
export { createTestUser };

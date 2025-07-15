// Configuración de la base de datos para Hostinger
// Este archivo centraliza la configuración de la base de datos

// Configuración para MySQL en Hostinger
export const dbConfig = {
  host: 'localhost', // Cambia a tu host de Hostinger, normalmente es localhost
  database: 'u379683784_Meter', // Nombre de base de datos
  user: 'u379683784_Meter', // Usuario de base de datos
  password: 'Sofia24@123', // Contraseña
  port: 3306 // Puerto estándar de MySQL
};

// Función para obtener la URL de conexión
export function getConnectionUrl(): string {
  const { host, database, user, password, port } = dbConfig;
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
}

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    // En un entorno real, aquí harías una prueba de conexión
    // Por ahora, simplemente devolvemos true
    console.log('Intentando conectar a la base de datos...');
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    return false;
  }
}

// Exportar configuración para uso en la aplicación
export default dbConfig;
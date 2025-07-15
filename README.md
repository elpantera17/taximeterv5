# Pantera Taximeter

Aplicación profesional de taxímetro para taxistas y empresas de transporte.

## Configuración para Hostinger

### Estructura de archivos

- `/public_html/taximeter/` - Carpeta principal de la aplicación
  - `/api/` - Backend PHP para comunicación con la base de datos
  - `/assets/` - Archivos estáticos (CSS, JS, imágenes)
  - `index.html` - Punto de entrada de la aplicación
  - `.htaccess` - Configuración de Apache

### Configuración de la base de datos

1. Accede al panel de control de Hostinger
2. Ve a la sección "Bases de datos MySQL"
3. Crea una nueva base de datos
4. Anota los siguientes datos:
   - Nombre de la base de datos (ej: `u123456789_pantera`)
   - Usuario de la base de datos (ej: `u123456789_pantera`)
   - Contraseña de la base de datos
   - Host de la base de datos (normalmente `localhost`)

### Actualización de credenciales

1. Edita el archivo `/public_html/taximeter/api/config.php`
2. Actualiza los siguientes valores con tus credenciales:
   ```php
   $db_config = [
       'host' => 'localhost', // Normalmente es localhost en Hostinger
       'database' => 'u123456789_pantera', // Cambia a tu nombre de base de datos
       'username' => 'u123456789_pantera', // Cambia a tu usuario de base de datos
       'password' => 'TuContraseñaSegura123', // Cambia a tu contraseña
       'charset' => 'utf8mb4',
       'collation' => 'utf8mb4_unicode_ci',
   ];
   ```

3. Edita el archivo `/public_html/taximeter/src/services/supabase.ts`
4. Actualiza los valores de configuración:
   ```typescript
   export const hostingerConfig = {
     host: 'localhost', // Cambia a tu host de Hostinger, normalmente es localhost
     database: 'u123456789_pantera', // Cambia a tu nombre de base de datos
     user: 'u123456789_pantera', // Cambia a tu usuario de base de datos
     password: 'TuContraseñaSegura123' // Cambia a tu contraseña
   };
   ```

### Importación de la base de datos

1. Accede a phpMyAdmin desde el panel de control de Hostinger
2. Selecciona tu base de datos
3. Ve a la pestaña "Importar"
4. Sube el archivo SQL proporcionado (`pantera_taximeter.sql`)
5. Haz clic en "Importar" para crear todas las tablas necesarias

### Credenciales de acceso

Una vez configurada la aplicación, puedes acceder con las siguientes credenciales:

- **Usuario administrador**:
  - Email: `test@pantera.local`
  - Contraseña: `test123456`

## Desarrollo local

### Requisitos

- Node.js 18+
- npm 9+

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Características

- Taxímetro en tiempo real
- Múltiples categorías de tarifas
- Tarificación dinámica
- Estadísticas de viajes
- Grupos de trabajo para empresas
- Sistema VIP con diferentes niveles
- Panel de administración
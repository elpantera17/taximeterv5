import { useState, useEffect } from 'react';

interface VersionInfo {
  currentVersion: string;
  requiredVersion: string;
  downloadUrl: string;
  forceUpdate: boolean;
}

interface VersionCheckResult {
  needsUpdate: boolean;
  versionInfo: VersionInfo | null;
  loading: boolean;
  error: string | null;
}

export function useVersionCheck(): VersionCheckResult {
  const [result, setResult] = useState<VersionCheckResult>({
    needsUpdate: false,
    versionInfo: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      setResult(prev => ({ ...prev, loading: true, error: null }));

      // Obtener versión actual de la app (actualizada a 1.0.1)
      const currentVersion = '1.0.1'; // ¡Ahora coincide con la versión requerida!

      // En producción, esto vendría de Supabase
      const mockSystemSettings = {
        app_version: '1.0.1',
        required_version: '1.0.1',
        download_url: 'https://github.com/pantera-taximeter/releases/latest',
        force_update: true
      };

      // Simular llamada a la API/Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));

      const requiredVersion = mockSystemSettings.required_version;
      const forceUpdate = mockSystemSettings.force_update;
      const downloadUrl = mockSystemSettings.download_url;

      // Comparar versiones
      const needsUpdate = compareVersions(currentVersion, requiredVersion) < 0 && forceUpdate;

      setResult({
        needsUpdate,
        versionInfo: needsUpdate ? {
          currentVersion,
          requiredVersion,
          downloadUrl,
          forceUpdate
        } : null,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error checking version:', error);
      setResult({
        needsUpdate: false,
        versionInfo: null,
        loading: false,
        error: 'Error al verificar la versión'
      });
    }
  };

  return result;
}

// Función para comparar versiones (semver básico)
function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Smartphone,
  Database,
  Shield,
  Bell,
  Zap,
  Download,
  Upload
} from 'lucide-react';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_name: string;
  setting_description: string;
  setting_value: any;
  is_public: boolean;
  requires_restart: boolean;
}

export function AdminSystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    setLoading(true);
    try {
      // En producción, esto vendría de Supabase
      const mockSettings: SystemSetting[] = [
        {
          id: '1',
          setting_key: 'whatsapp_number',
          setting_name: 'Número de WhatsApp',
          setting_description: 'Número de WhatsApp para contacto y compras VIP',
          setting_value: '+18098522664',
          is_public: true,
          requires_restart: false
        },
        {
          id: '2',
          setting_key: 'app_version',
          setting_name: 'Versión de la Aplicación',
          setting_description: 'Versión actual de la aplicación',
          setting_value: '1.0.0',
          is_public: true,
          requires_restart: false
        },
        {
          id: '3',
          setting_key: 'required_version',
          setting_name: 'Versión Requerida',
          setting_description: 'Versión mínima requerida para usar la aplicación',
          setting_value: '1.0.1',
          is_public: true,
          requires_restart: false
        },
        {
          id: '4',
          setting_key: 'download_url',
          setting_name: 'URL de Descarga',
          setting_description: 'Enlace para descargar la versión más reciente',
          setting_value: 'https://github.com/pantera-taximeter/releases/latest',
          is_public: true,
          requires_restart: false
        },
        {
          id: '5',
          setting_key: 'force_update',
          setting_name: 'Actualización Obligatoria',
          setting_description: 'Forzar actualización para versiones anteriores',
          setting_value: true,
          is_public: true,
          requires_restart: false
        },
        {
          id: '6',
          setting_key: 'maintenance_mode',
          setting_name: 'Modo de Mantenimiento',
          setting_description: 'Activar/desactivar modo de mantenimiento',
          setting_value: { enabled: false, message: 'Sistema en mantenimiento' },
          is_public: true,
          requires_restart: false
        },
        {
          id: '7',
          setting_key: 'vip_pricing_editable',
          setting_name: 'Precios VIP Editables',
          setting_description: 'Permitir edición de precios VIP desde admin',
          setting_value: { enabled: true },
          is_public: false,
          requires_restart: false
        },
        {
          id: '8',
          setting_key: 'max_trip_duration',
          setting_name: 'Duración Máxima de Viaje',
          setting_description: 'Tiempo máximo permitido para un viaje (en horas)',
          setting_value: 24,
          is_public: false,
          requires_restart: false
        },
        {
          id: '9',
          setting_key: 'auto_backup',
          setting_name: 'Respaldo Automático',
          setting_description: 'Configuración de respaldos automáticos',
          setting_value: { enabled: true, frequency: 'daily', retention_days: 30 },
          is_public: false,
          requires_restart: false
        },
        {
          id: '10',
          setting_key: 'notification_settings',
          setting_name: 'Configuración de Notificaciones',
          setting_description: 'Configuración global de notificaciones push',
          setting_value: { 
            enabled: true, 
            trip_reminders: true, 
            vip_promotions: true,
            system_alerts: true 
          },
          is_public: false,
          requires_restart: false
        },
        {
          id: '11',
          setting_key: 'api_rate_limits',
          setting_name: 'Límites de API',
          setting_description: 'Configuración de límites de velocidad para API',
          setting_value: { 
            requests_per_minute: 100, 
            requests_per_hour: 1000,
            burst_limit: 20
          },
          is_public: false,
          requires_restart: true
        }
      ];

      setSettings(mockSettings);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar configuraciones del sistema' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingId: string, newValue: any) => {
    setSaving(true);
    try {
      setSettings(prev => 
        prev.map(setting => 
          setting.id === settingId 
            ? { ...setting, setting_value: newValue }
            : setting
        )
      );

      setMessage({ type: 'success', text: 'Configuración actualizada correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const getSettingIcon = (key: string) => {
    switch (key) {
      case 'whatsapp_number':
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'app_version':
      case 'required_version':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'download_url':
        return <Download className="w-5 h-5 text-purple-600" />;
      case 'force_update':
        return <Upload className="w-5 h-5 text-orange-600" />;
      case 'maintenance_mode':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'vip_pricing_editable':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'max_trip_duration':
        return <Globe className="w-5 h-5 text-indigo-600" />;
      case 'auto_backup':
        return <Database className="w-5 h-5 text-teal-600" />;
      case 'notification_settings':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      case 'api_rate_limits':
        return <Settings className="w-5 h-5 text-red-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando configuraciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración del Sistema
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las configuraciones globales de la aplicación
          </p>
        </div>
        <button
          onClick={loadSystemSettings}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm ${
            message.type === 'success' 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Update Control Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Control de Actualizaciones
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Gestiona las versiones de la aplicación y controla cuándo los usuarios deben actualizar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Versión Actual</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  v{settings.find(s => s.setting_key === 'app_version')?.setting_value || '1.0.0'}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Versión Requerida</div>
                <div className="font-bold text-orange-600 dark:text-orange-400">
                  v{settings.find(s => s.setting_key === 'required_version')?.setting_value || '1.0.1'}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actualización</div>
                <div className={`font-bold ${
                  settings.find(s => s.setting_key === 'force_update')?.setting_value 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {settings.find(s => s.setting_key === 'force_update')?.setting_value ? 'Obligatoria' : 'Opcional'}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</div>
                <div className="font-bold text-green-600 dark:text-green-400">
                  Activo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settings.map((setting) => (
          <SettingCard
            key={setting.id}
            setting={setting}
            onUpdate={(newValue) => updateSetting(setting.id, newValue)}
            saving={saving}
            icon={getSettingIcon(setting.setting_key)}
          />
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-2">Información sobre las configuraciones:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Configuraciones públicas:</strong> Son visibles para todos los usuarios</li>
              <li><strong>Configuraciones privadas:</strong> Solo visibles para administradores</li>
              <li><strong>Requiere reinicio:</strong> Los cambios se aplicarán después de reiniciar la aplicación</li>
              <li><strong>Control de versiones:</strong> Gestiona actualizaciones obligatorias automáticamente</li>
              <li><strong>Respaldo automático:</strong> Las configuraciones se respaldan automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada tarjeta de configuración
function SettingCard({ setting, onUpdate, saving, icon }: {
  setting: SystemSetting;
  onUpdate: (value: any) => void;
  saving: boolean;
  icon: React.ReactNode;
}) {
  const [localValue, setLocalValue] = useState(setting.setting_value);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalValue(setting.setting_value);
    setHasChanges(false);
  }, [setting.setting_value]);

  const handleValueChange = (newValue: any) => {
    setLocalValue(newValue);
    setHasChanges(JSON.stringify(newValue) !== JSON.stringify(setting.setting_value));
  };

  const handleSave = () => {
    onUpdate(localValue);
    setHasChanges(false);
  };

  const renderValueInput = () => {
    switch (setting.setting_key) {
      case 'whatsapp_number':
        return (
          <input
            type="tel"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="+1234567890"
          />
        );

      case 'app_version':
      case 'required_version':
        return (
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="1.0.0"
          />
        );

      case 'download_url':
        return (
          <input
            type="url"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://github.com/pantera-taximeter/releases/latest"
          />
        );

      case 'force_update':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localValue}
              onChange={(e) => handleValueChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Forzar actualización obligatoria
            </span>
          </label>
        );

      case 'maintenance_mode':
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localValue.enabled}
                onChange={(e) => handleValueChange({ ...localValue, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Modo de mantenimiento activo</span>
            </label>
            <input
              type="text"
              value={localValue.message}
              onChange={(e) => handleValueChange({ ...localValue, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Mensaje de mantenimiento"
            />
          </div>
        );

      case 'vip_pricing_editable':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localValue.enabled}
              onChange={(e) => handleValueChange({ ...localValue, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Permitir edición de precios VIP</span>
          </label>
        );

      case 'max_trip_duration':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="48"
              value={localValue}
              onChange={(e) => handleValueChange(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <span className="text-sm text-gray-500">horas</span>
          </div>
        );

      case 'auto_backup':
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localValue.enabled}
                onChange={(e) => handleValueChange({ ...localValue, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Respaldo automático activo</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={localValue.frequency}
                onChange={(e) => handleValueChange({ ...localValue, frequency: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="hourly">Cada hora</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={localValue.retention_days}
                  onChange={(e) => handleValueChange({ ...localValue, retention_days: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-xs text-gray-500">días</span>
              </div>
            </div>
          </div>
        );

      case 'notification_settings':
        return (
          <div className="space-y-2">
            {Object.entries(localValue).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleValueChange({ ...localValue, [key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        );

      case 'api_rate_limits':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Solicitudes por minuto</label>
              <input
                type="number"
                min="1"
                value={localValue.requests_per_minute}
                onChange={(e) => handleValueChange({ ...localValue, requests_per_minute: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Solicitudes por hora</label>
              <input
                type="number"
                min="1"
                value={localValue.requests_per_hour}
                onChange={(e) => handleValueChange({ ...localValue, requests_per_hour: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Límite de ráfaga</label>
              <input
                type="number"
                min="1"
                value={localValue.burst_limit}
                onChange={(e) => handleValueChange({ ...localValue, burst_limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      default:
        return (
          <textarea
            value={JSON.stringify(localValue, null, 2)}
            onChange={(e) => {
              try {
                handleValueChange(JSON.parse(e.target.value));
              } catch {
                // Ignore invalid JSON
              }
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
          />
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {icon}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {setting.setting_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {setting.setting_description}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {setting.is_public && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                  Público
                </span>
              )}
              {setting.requires_restart && (
                <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded">
                  Requiere reinicio
                </span>
              )}
              {setting.setting_key.includes('version') || setting.setting_key === 'force_update' || setting.setting_key === 'download_url' && (
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                  Control de Versiones
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {renderValueInput()}
        
        {hasChanges && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
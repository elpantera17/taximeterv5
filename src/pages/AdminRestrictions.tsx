import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  TrendingUp, 
  Clock, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info,
  Edit,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Restriction {
  id: string;
  restriction_key: string;
  restriction_name: string;
  restriction_description: string;
  default_value: {
    max_trips_per_day?: number;
    max_multiplier?: number;
    enabled: boolean;
    statistics_enabled?: boolean;
    export_enabled?: boolean;
    history_limit?: number;
  };
  applies_to_roles: string[];
  is_active: boolean;
}

export function AdminRestrictions() {
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingRestriction, setEditingRestriction] = useState<string | null>(null);

  // Simular carga de restricciones desde Supabase
  useEffect(() => {
    loadRestrictions();
  }, []);

  const loadRestrictions = async () => {
    setLoading(true);
    try {
      // En producción, esto vendría de Supabase
      const mockRestrictions: Restriction[] = [
        {
          id: '1',
          restriction_key: 'daily_trip_limit',
          restriction_name: 'Límite de Viajes Diarios',
          restriction_description: 'Número máximo de viajes que puede realizar un usuario normal por día',
          default_value: {
            max_trips_per_day: 10,
            enabled: true
          },
          applies_to_roles: ['normal'],
          is_active: true
        },
        {
          id: '2',
          restriction_key: 'dynamic_pricing_limit',
          restriction_name: 'Límite de Tarifa Dinámica',
          restriction_description: 'Multiplicador máximo permitido para usuarios normales',
          default_value: {
            max_multiplier: 2.0,
            enabled: true
          },
          applies_to_roles: ['normal'],
          is_active: true
        },
        {
          id: '3',
          restriction_key: 'advanced_features',
          restriction_name: 'Funciones Avanzadas',
          restriction_description: 'Acceso a funciones avanzadas como estadísticas detalladas',
          default_value: {
            statistics_enabled: false,
            export_enabled: false,
            history_limit: 30,
            enabled: true
          },
          applies_to_roles: ['normal'],
          is_active: true
        }
      ];

      setRestrictions(mockRestrictions);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar las restricciones' });
    } finally {
      setLoading(false);
    }
  };

  const updateRestriction = async (restrictionId: string, newValue: any) => {
    setSaving(true);
    try {
      // En producción, esto actualizaría Supabase
      setRestrictions(prev => 
        prev.map(restriction => 
          restriction.id === restrictionId 
            ? { ...restriction, default_value: newValue }
            : restriction
        )
      );

      setMessage({ type: 'success', text: 'Restricción actualizada correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar la restricción' });
    } finally {
      setSaving(false);
    }
  };

  const toggleRestrictionStatus = async (restrictionId: string) => {
    setSaving(true);
    try {
      setRestrictions(prev => 
        prev.map(restriction => 
          restriction.id === restrictionId 
            ? { ...restriction, is_active: !restriction.is_active }
            : restriction
        )
      );

      setMessage({ type: 'success', text: 'Estado de restricción actualizado' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cambiar el estado' });
    } finally {
      setSaving(false);
    }
  };

  const getRestrictionIcon = (key: string) => {
    switch (key) {
      case 'daily_trip_limit':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'dynamic_pricing_limit':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'advanced_features':
        return <Settings className="w-5 h-5 text-purple-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando restricciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Restricciones
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configura las limitaciones para usuarios normales
          </p>
        </div>
        <button
          onClick={loadRestrictions}
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

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">¿Cómo funcionan las restricciones?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Las restricciones solo se aplican a usuarios con rol "normal"</li>
              <li>Los usuarios VIP y administradores no tienen limitaciones</li>
              <li>Los cambios se aplican inmediatamente en toda la aplicación</li>
              <li>Puedes desactivar restricciones temporalmente sin eliminarlas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Restrictions List */}
      <div className="space-y-4">
        {restrictions.map((restriction) => (
          <div
            key={restriction.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${
              !restriction.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {getRestrictionIcon(restriction.restriction_key)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {restriction.restriction_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {restriction.restriction_description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      Aplica a: {restriction.applies_to_roles.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleRestrictionStatus(restriction.id)}
                  disabled={saving}
                  className="flex items-center space-x-1 text-sm"
                >
                  {restriction.is_active ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                  <span className={restriction.is_active ? 'text-green-600' : 'text-gray-400'}>
                    {restriction.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </button>
              </div>
            </div>

            {/* Restriction Controls */}
            <div className="space-y-4">
              {/* Daily Trip Limit */}
              {restriction.restriction_key === 'daily_trip_limit' && (
                <DailyTripLimitControl
                  restriction={restriction}
                  onUpdate={(newValue) => updateRestriction(restriction.id, newValue)}
                  saving={saving}
                />
              )}

              {/* Dynamic Pricing Limit */}
              {restriction.restriction_key === 'dynamic_pricing_limit' && (
                <DynamicPricingLimitControl
                  restriction={restriction}
                  onUpdate={(newValue) => updateRestriction(restriction.id, newValue)}
                  saving={saving}
                />
              )}

              {/* Advanced Features */}
              {restriction.restriction_key === 'advanced_features' && (
                <AdvancedFeaturesControl
                  restriction={restriction}
                  onUpdate={(newValue) => updateRestriction(restriction.id, newValue)}
                  saving={saving}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para controlar límite de viajes diarios
function DailyTripLimitControl({ restriction, onUpdate, saving }: {
  restriction: Restriction;
  onUpdate: (value: any) => void;
  saving: boolean;
}) {
  const [maxTrips, setMaxTrips] = useState(restriction.default_value.max_trips_per_day || 10);
  const [enabled, setEnabled] = useState(restriction.default_value.enabled);

  const handleSave = () => {
    onUpdate({
      max_trips_per_day: maxTrips,
      enabled: enabled
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Máximo de viajes por día
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={maxTrips}
            onChange={(e) => setMaxTrips(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Restricción habilitada
            </span>
          </label>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
}

// Componente para controlar límite de tarifa dinámica
function DynamicPricingLimitControl({ restriction, onUpdate, saving }: {
  restriction: Restriction;
  onUpdate: (value: any) => void;
  saving: boolean;
}) {
  const [maxMultiplier, setMaxMultiplier] = useState(restriction.default_value.max_multiplier || 2.0);
  const [enabled, setEnabled] = useState(restriction.default_value.enabled);

  const handleSave = () => {
    onUpdate({
      max_multiplier: maxMultiplier,
      enabled: enabled
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Multiplicador máximo
          </label>
          <input
            type="number"
            min="1.0"
            max="5.0"
            step="0.1"
            value={maxMultiplier}
            onChange={(e) => setMaxMultiplier(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ejemplo: 2.0 = máximo 200% de la tarifa base
          </p>
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Restricción habilitada
            </span>
          </label>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
}

// Componente para controlar funciones avanzadas
function AdvancedFeaturesControl({ restriction, onUpdate, saving }: {
  restriction: Restriction;
  onUpdate: (value: any) => void;
  saving: boolean;
}) {
  const [statisticsEnabled, setStatisticsEnabled] = useState(restriction.default_value.statistics_enabled || false);
  const [exportEnabled, setExportEnabled] = useState(restriction.default_value.export_enabled || false);
  const [historyLimit, setHistoryLimit] = useState(restriction.default_value.history_limit || 30);
  const [enabled, setEnabled] = useState(restriction.default_value.enabled);

  const handleSave = () => {
    onUpdate({
      statistics_enabled: statisticsEnabled,
      export_enabled: exportEnabled,
      history_limit: historyLimit,
      enabled: enabled
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={statisticsEnabled}
                onChange={(e) => setStatisticsEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Estadísticas avanzadas habilitadas
              </span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportEnabled}
                onChange={(e) => setExportEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Exportación de datos habilitada
              </span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Límite de historial (días)
            </label>
            <input
              type="number"
              min="7"
              max="365"
              value={historyLimit}
              onChange={(e) => setHistoryLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Restricciones habilitadas
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
}
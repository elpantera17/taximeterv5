import React, { useState } from 'react';
import { Sun, Moon, Palette, Globe, Smartphone, Info, TrendingUp } from 'lucide-react';
import { Header } from '../components/Header';
import { DynamicPricingModal } from '../components/DynamicPricingModal';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { state, dispatch } = useApp();
  const [showDynamicModal, setShowDynamicModal] = useState(false);

  const handleThemeChange = (theme: 'light' | 'dark' | 'night') => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme } });
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'night');
    root.classList.add(theme);
    
    if (theme === 'dark' || theme === 'night') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleLanguageChange = (language: 'es' | 'en') => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { language } });
  };

  const handleDefaultFareChange = (defaultFareCategory: string) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { defaultFareCategory } });
  };

  const handleDynamicChange = (multiplier: number) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { dynamicMultiplier: multiplier }
    });
    setShowDynamicModal(false);
  };

  const activeFare = state.fareCategories.find(f => f.isActive) || state.fareCategories[0];

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier === 1.0) return 'text-green-600 dark:text-green-400';
    if (multiplier <= 1.5) return 'text-yellow-600 dark:text-yellow-400';
    if (multiplier <= 2.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Ajustes" />
      
      <div className="p-4 space-y-6">
        {/* Dynamic Pricing Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tarificación Dinámica
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Multiplicador actual
                </div>
                <div className={`text-2xl font-bold ${getMultiplierColor(state.settings.dynamicMultiplier)}`}>
                  {state.settings.dynamicMultiplier.toFixed(1)}x
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {state.settings.dynamicMultiplier > 1.0 
                    ? `+${((state.settings.dynamicMultiplier - 1) * 100).toFixed(0)}% sobre tarifa base`
                    : 'Tarifa normal'
                  }
                </div>
              </div>
              <button
                onClick={() => setShowDynamicModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Ajustar
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Vista previa del impacto en tarifa base ($100):
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Precio final:</span>
                <span className="font-bold text-lg">
                  ${(100 * state.settings.dynamicMultiplier).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Apariencia
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tema de la aplicación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: 'Claro', icon: Sun, description: 'Tema brillante' },
                    { key: 'dark', label: 'Oscuro', icon: Moon, description: 'Tema oscuro' },
                    { key: 'night', label: 'Noche', icon: Moon, description: 'Ultra oscuro' },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.key}
                        onClick={() => handleThemeChange(theme.key as any)}
                        className={`
                          p-4 rounded-lg border-2 text-center transition-all
                          ${state.settings.theme === theme.key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">{theme.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {theme.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Idioma
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'es', label: 'Español', description: 'Idioma por defecto' },
                { key: 'en', label: 'English', description: 'English language' },
              ].map((language) => (
                <button
                  key={language.key}
                  onClick={() => handleLanguageChange(language.key as any)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${state.settings.language === language.key
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div className="font-medium">{language.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Fare Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de viajes
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Categoría de tarifa predeterminada
              </label>
              <select
                value={state.settings.defaultFareCategory}
                onChange={(e) => handleDefaultFareChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {state.fareCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Esta tarifa se usará por defecto al iniciar nuevos viajes
              </p>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información de la aplicación
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Versión</span>
              <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tarifa activa</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{activeFare.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Multiplicador dinámico</span>
              <span className={`font-medium ${getMultiplierColor(state.settings.dynamicMultiplier)}`}>
                {state.settings.dynamicMultiplier.toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total de viajes</span>
              <span className="font-medium text-green-600 dark:text-green-400">{state.stats.totalTrips}</span>
            </div>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
                  dispatch({
                    type: 'UPDATE_SETTINGS',
                    payload: {
                      theme: 'light',
                      defaultFareCategory: state.fareCategories[0]?.id || '1',
                      dynamicMultiplier: 1.0,
                      language: 'es',
                    }
                  });
                  handleThemeChange('light');
                }
              }}
              className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
            >
              Restablecer configuraciones
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Pricing Modal */}
      {showDynamicModal && (
        <DynamicPricingModal
          currentMultiplier={state.settings.dynamicMultiplier}
          onApply={handleDynamicChange}
          onClose={() => setShowDynamicModal(false)}
        />
      )}
    </div>
  );
}
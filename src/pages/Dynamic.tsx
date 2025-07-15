import React from 'react';
import { TrendingUp, Clock, Users, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';

const multiplierOptions = [
  { value: 1.0, label: '1.0x', description: 'Normal' },
  { value: 1.2, label: '1.2x', description: 'Demanda ligera' },
  { value: 1.5, label: '1.5x', description: 'Demanda moderada' },
  { value: 2.0, label: '2.0x', description: 'Alta demanda' },
  { value: 2.5, label: '2.5x', description: 'Muy alta demanda' },
  { value: 3.0, label: '3.0x', description: 'Demanda extrema' },
  { value: 3.5, label: '3.5x', description: 'Pico máximo' },
  { value: 4.0, label: '4.0x', description: 'Tarifa de emergencia' },
];

export function Dynamic() {
  const { state, dispatch } = useApp();
  const currentMultiplier = state.settings.dynamicMultiplier;

  const handleMultiplierChange = (multiplier: number) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { dynamicMultiplier: multiplier }
    });
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier === 1.0) return 'text-green-600 border-green-200 bg-green-50';
    if (multiplier <= 1.5) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    if (multiplier <= 2.5) return 'text-orange-600 border-orange-200 bg-orange-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getDynamicColorClasses = (multiplier: number) => {
    if (multiplier === 1.0) return 'from-green-500 to-green-600';
    if (multiplier <= 1.5) return 'from-yellow-500 to-yellow-600';
    if (multiplier <= 2.5) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Tarifa dinámica" />
      
      <div className="p-4 space-y-6">
        {/* Current Multiplier Display */}
        <div className={`bg-gradient-to-r ${getDynamicColorClasses(currentMultiplier)} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h2 className="text-xl font-bold">Multiplicador actual</h2>
              </div>
              <p className="text-white text-opacity-90">
                {multiplierOptions.find(opt => opt.value === currentMultiplier)?.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{currentMultiplier}x</div>
              <div className="text-white text-opacity-75 text-sm">
                {currentMultiplier > 1.0 ? `+${((currentMultiplier - 1) * 100).toFixed(0)}%` : 'Base'}
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Tiempo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ajusta según la hora del día
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Demanda</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aumenta con mayor demanda
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Eventos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para situaciones especiales
            </p>
          </div>
        </div>

        {/* Multiplier Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Seleccionar multiplicador
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Ajusta el multiplicador según las condiciones del mercado
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {multiplierOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMultiplierChange(option.value)}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${currentMultiplier === option.value
                      ? `${getMultiplierColor(option.value)} border-current ring-2 ring-current ring-opacity-20`
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div className="text-2xl font-bold mb-1">{option.label}</div>
                  <div className={`text-sm ${
                    currentMultiplier === option.value
                      ? 'text-current'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Impacto de la tarifa dinámica
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Tarifa ejemplo ($100 base):</span>
              <span className="font-bold text-lg">
                ${(100 * currentMultiplier).toFixed(2)}
              </span>
            </div>
            
            {currentMultiplier > 1.0 && (
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-orange-700 dark:text-orange-300">Incremento:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  +${((100 * currentMultiplier) - 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Consejos para usar tarifa dinámica:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Usa multiplicadores altos durante eventos especiales</li>
                  <li>Ajusta según la demanda en tiempo real</li>
                  <li>Considera las condiciones climáticas</li>
                  <li>Comunica claramente los precios a los pasajeros</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
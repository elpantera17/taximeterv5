import React, { useState } from 'react';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';

interface DynamicPricingModalProps {
  currentMultiplier: number;
  onApply: (multiplier: number) => void;
  onClose: () => void;
}

export function DynamicPricingModal({ currentMultiplier, onApply, onClose }: DynamicPricingModalProps) {
  const [selectedMultiplier, setSelectedMultiplier] = useState(currentMultiplier);

  const handleApply = () => {
    onApply(selectedMultiplier);
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier === 1.0) return 'from-green-500 to-green-600';
    if (multiplier <= 1.5) return 'from-yellow-500 to-yellow-600';
    if (multiplier <= 2.5) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getMultiplierLabel = (multiplier: number) => {
    if (multiplier === 1.0) return 'Normal';
    if (multiplier <= 1.2) return 'Demanda Baja';
    if (multiplier <= 1.5) return 'Demanda Media';
    if (multiplier <= 2.0) return 'Demanda Alta';
    if (multiplier <= 2.5) return 'Demanda Muy Alta';
    return 'Demanda Extrema';
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tarificación Dinámica
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajustar multiplicador de tarifa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Multiplier Display */}
          <div className={`bg-gradient-to-r ${getMultiplierColor(selectedMultiplier)} rounded-xl p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Multiplicador seleccionado</div>
                <div className="text-lg font-medium">{getMultiplierLabel(selectedMultiplier)}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{selectedMultiplier.toFixed(1)}x</div>
                <div className="text-sm opacity-75">
                  {selectedMultiplier > 1.0 ? `+${((selectedMultiplier - 1) * 100).toFixed(0)}%` : 'Base'}
                </div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ajustar multiplicador
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                1.0x - 4.0x
              </span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={selectedMultiplier}
                onChange={(e) => setSelectedMultiplier(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    #10b981 0%, #10b981 ${((1.0 - 1.0) / (4.0 - 1.0)) * 100}%,
                    #f59e0b ${((1.5 - 1.0) / (4.0 - 1.0)) * 100}%, #f59e0b ${((2.0 - 1.0) / (4.0 - 1.0)) * 100}%,
                    #f97316 ${((2.5 - 1.0) / (4.0 - 1.0)) * 100}%, #f97316 ${((3.0 - 1.0) / (4.0 - 1.0)) * 100}%,
                    #ef4444 ${((3.0 - 1.0) / (4.0 - 1.0)) * 100}%, #ef4444 100%)`
                }}
              />
              
              {/* Slider markers */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>1.0x</span>
                <span>1.5x</span>
                <span>2.0x</span>
                <span>2.5x</span>
                <span>3.0x</span>
                <span>4.0x</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          {selectedMultiplier > 1.0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Multiplicador Activo</p>
                  <p>Las tarifas se incrementarán según el multiplicador seleccionado. Asegúrate de informar al pasajero.</p>
                </div>
              </div>
            </div>
          )}

          {/* Impact Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vista previa del impacto
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tarifa base ($100):</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${(100 * selectedMultiplier).toFixed(2)}
                </span>
              </div>
              {selectedMultiplier > 1.0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600 dark:text-orange-400">Incremento:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    +${((100 * selectedMultiplier) - 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className={`px-6 py-2 bg-gradient-to-r ${getMultiplierColor(selectedMultiplier)} text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg`}
          >
            Aplicar {selectedMultiplier.toFixed(1)}x
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
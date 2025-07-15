import React, { useState } from 'react';
import { X, MapPin, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Trip } from '../types';
import { formatCurrency, formatDuration, formatDistance } from '../utils/calculations';

interface TripCompletionModalProps {
  trip: Trip;
  onComplete: (trip: Trip) => void;
  onClose: () => void;
}

export function TripCompletionModal({ trip, onComplete, onClose }: TripCompletionModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
  };

  const handleComplete = () => {
    onComplete(trip);
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  // Calcular costos individuales para el desglose
  const basicFare = trip.fareCategory.basicFare;
  const distanceCost = trip.distance * trip.fareCategory.costPerKm;
  const timeCost = (trip.duration / 60) * trip.fareCategory.costPerMinute;
  const subtotal = basicFare + distanceCost + timeCost;
  const minimumFareApplied = Math.max(subtotal, trip.fareCategory.minimumFare);
  const dynamicSurcharge = minimumFareApplied * (trip.dynamicMultiplier - 1);

  if (isConfirming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¿Cerrar el viaje?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta acción terminará el viaje, no es posible deshacer esta acción.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                NO
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                SÍ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Resumen del Viaje</h2>
                <p className="text-green-100 text-sm">Viaje completado exitosamente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Distancia</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {formatDistance(trip.distance, trip.fareCategory.measurementUnit)}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Duración</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {formatDuration(trip.duration)}
                </div>
              </div>
            </div>
            
            <div className="border-t dark:border-gray-600 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fecha y hora:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(trip.startTime).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Desglose de tarifa</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tarifa básica:</span>
                <span className="font-medium">
                  {formatCurrency(basicFare, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Precio por km ({formatDistance(trip.distance, trip.fareCategory.measurementUnit)}):
                </span>
                <span className="font-medium">
                  {formatCurrency(distanceCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Precio por minutos ({formatDuration(trip.duration)}):
                </span>
                <span className="font-medium">
                  {formatCurrency(timeCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                </span>
              </div>

              {trip.dynamicMultiplier > 1.0 && (
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 dark:text-orange-400">
                    Tarifa dinámica ({trip.dynamicMultiplier.toFixed(1)}x):
                  </span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    +{formatCurrency(dynamicSurcharge, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                  </span>
                </div>
              )}

              {minimumFareApplied > subtotal && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 dark:text-blue-400">
                    Ajuste tarifa mínima:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    +{formatCurrency(minimumFareApplied - subtotal, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t dark:border-gray-600 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(trip.totalCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                </span>
              </div>
            </div>
          </div>

          {/* Trip Category */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Categoría de tarifa:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">{trip.fareCategory.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Continuar viaje
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Finalizar viaje</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { MapPin, Clock, Calendar, Filter, Eye } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDuration, formatDistance } from '../utils/calculations';
import { Trip } from '../types';

export function Trips() {
  const { state } = useApp();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');

  const filteredTrips = state.trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">En curso</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">Completado</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">Pendiente</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Viajes" />
      
      <div className="p-4 space-y-4">
        {/* Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          {[
            { key: 'all', label: 'Todos' },
            { key: 'completed', label: 'Completados' },
            { key: 'active', label: 'En curso' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Trips List */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay viajes
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Aún no has realizado ningún viaje.' 
                  : `No hay viajes ${filter === 'completed' ? 'completados' : 'en curso'}.`}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(trip.startTime).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(trip.startTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {trip.endTime && (
                          <span>
                            {' - '}
                            {new Date(trip.endTime).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(trip.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400">Distancia</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatDistance(trip.distance, trip.fareCategory.measurementUnit)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400">Duración</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatDuration(trip.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {trip.fareCategory.name}
                      {trip.dynamicMultiplier > 1.0 && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          {trip.dynamicMultiplier}x
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(trip.totalCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Ver detalles</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalles del viaje
                </h3>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Fecha</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTrip.startTime).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Estado</div>
                  <div>{getStatusBadge(selectedTrip.status)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ubicaciones</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedTrip.startLocation.address || 'Origen'}
                    </span>
                  </div>
                  {selectedTrip.endLocation && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedTrip.endLocation.address || 'Destino'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Distancia</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDistance(selectedTrip.distance, selectedTrip.fareCategory.measurementUnit)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Duración</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(selectedTrip.duration)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tarifa</div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Categoría:</span>
                    <span className="font-medium">{selectedTrip.fareCategory.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Tarifa básica:</span>
                    <span>{formatCurrency(selectedTrip.fareCategory.basicFare, selectedTrip.fareCategory.currencySymbol, selectedTrip.fareCategory.decimalDigits)}</span>
                  </div>
                  {selectedTrip.dynamicMultiplier > 1.0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Multiplicador:</span>
                      <span className="text-orange-600 dark:text-orange-400">{selectedTrip.dynamicMultiplier}x</span>
                    </div>
                  )}
                  <div className="border-t dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedTrip.totalCost, selectedTrip.fareCategory.currencySymbol, selectedTrip.fareCategory.decimalDigits)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
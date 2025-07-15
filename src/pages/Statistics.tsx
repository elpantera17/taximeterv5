import React from 'react';
import { TrendingUp, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDuration, formatDistance } from '../utils/calculations';

export function Statistics() {
  const { state } = useApp();
  const { stats, trips } = state;
  const activeFare = state.fareCategories.find(f => f.isActive) || state.fareCategories[0];

  const recentTrips = trips
    .filter(trip => trip.status === 'completed')
    .slice(-5)
    .reverse();

  const statsCards = [
    {
      title: 'Total de viajes',
      value: stats.totalTrips.toString(),
      icon: MapPin,
      color: 'bg-blue-500',
    },
    {
      title: 'Ganancias totales',
      value: formatCurrency(stats.totalEarnings, activeFare.currencySymbol, activeFare.decimalDigits),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Distancia total',
      value: formatDistance(stats.totalDistance, activeFare.measurementUnit),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      title: 'Tiempo total',
      value: formatDuration(stats.totalTime),
      icon: Clock,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Estadísticas" />
      
      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Average Trip */}
        {stats.totalTrips > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Promedio por viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.averageTrip, activeFare.currencySymbol, activeFare.decimalDigits)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ganancia promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDistance(stats.totalDistance / Math.max(stats.totalTrips, 1), activeFare.measurementUnit)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Distancia promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatDuration(stats.totalTime / Math.max(stats.totalTrips, 1))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo promedio</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Trips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Viajes recientes
            </h3>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {recentTrips.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No hay viajes completados aún
              </div>
            ) : (
              recentTrips.map((trip) => (
                <div key={trip.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
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
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistance(trip.distance, trip.fareCategory.measurementUnit)} • {formatDuration(trip.duration)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(trip.totalCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {trip.fareCategory.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
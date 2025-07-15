import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface SimpleMapProps {
  center: { lat: number; lng: number };
  markers?: Array<{
    position: { lat: number; lng: number };
    popup?: string;
    icon?: 'start' | 'end' | 'current';
  }>;
  className?: string;
}

export function SimpleMap({ center, markers = [], className = "h-full w-full" }: SimpleMapProps) {
  const getMarkerColor = (iconType?: 'start' | 'end' | 'current') => {
    switch (iconType) {
      case 'start':
        return 'text-green-500';
      case 'end':
        return 'text-red-500';
      case 'current':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${className} relative overflow-hidden`} style={{ zIndex: 1 }}>
      {/* Map Background with Street Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
        {/* Street Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizontal streets */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 10}
              x2="100"
              y2={i * 10}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400 dark:text-gray-500"
            />
          ))}
          {/* Vertical streets */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 10}
              y1="0"
              x2={i * 10}
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400 dark:text-gray-500"
            />
          ))}
          {/* Main roads */}
          <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="1" className="text-gray-500 dark:text-gray-400" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="currentColor" strokeWidth="1" className="text-gray-500 dark:text-gray-400" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-500 dark:text-gray-400" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-500 dark:text-gray-400" />
        </svg>

        {/* Building blocks */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-gray-200 dark:bg-gray-600 opacity-30 rounded-sm"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 8 + 4}%`,
                height: `${Math.random() * 8 + 4}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-8 h-8 border-2 border-blue-500 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center animate-pulse">
          <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Location Info Card */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Tu ubicación</span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>Lat: {center.lat.toFixed(6)}</div>
          <div>Lng: {center.lng.toFixed(6)}</div>
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400">GPS activo</span>
          </div>
        </div>
      </div>

      {/* Markers */}
      {markers.map((marker, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${50 + (marker.position.lng - center.lng) * 1000}%`,
            top: `${50 - (marker.position.lat - center.lat) * 1000}%`,
          }}
        >
          <div className={`${getMarkerColor(marker.icon)} animate-bounce drop-shadow-lg`}>
            <MapPin className="w-8 h-8" fill="currentColor" />
          </div>
          {marker.popup && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-md shadow-lg px-3 py-2 text-xs whitespace-nowrap border border-gray-200 dark:border-gray-700">
              <div className="text-gray-900 dark:text-white font-medium">{marker.popup}</div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
            </div>
          )}
        </div>
      ))}

      {/* Compass */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 relative">
          <Compass className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-red-500 rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">
            N
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-md shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-1 bg-gray-400 dark:bg-gray-600 relative">
            <div className="absolute left-0 top-0 w-1 h-3 bg-gray-400 dark:bg-gray-600 -mt-1"></div>
            <div className="absolute right-0 top-0 w-1 h-3 bg-gray-400 dark:bg-gray-600 -mt-1"></div>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">1 km</span>
        </div>
      </div>

      {/* Traffic indicators */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Tráfico fluido</span>
          </div>
        </div>
      </div>
    </div>
  );
}
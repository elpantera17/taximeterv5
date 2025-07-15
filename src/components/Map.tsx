import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    popup?: string;
    icon?: 'start' | 'end' | 'current';
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  isVipUser?: boolean;
}

function MapController({ center, zoom = 13 }: { center: { lat: number; lng: number }; zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);
  
  return null;
}

export function Map({ center, zoom = 13, markers = [], onMapClick, className = "h-full w-full", isVipUser = false }: MapProps) {
  const mapRef = useRef<L.Map>(null);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onMapClick) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  const getIcon = (iconType?: 'start' | 'end' | 'current') => {
    switch (iconType) {
      case 'start':
        return new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      case 'end':
        return new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      case 'current':
        return new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      default:
        return new L.Icon.Default();
    }
  };

  // Determinar qué tipo de mapa usar
  const getTileLayer = () => {
    if (isVipUser) {
      // Para usuarios VIP: Usar tiles de mejor calidad (simulando Google Maps style)
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | VIP Enhanced'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
      );
    } else {
      // Para usuarios normales: OpenStreetMap estándar
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      );
    }
  };

  return (
    <div className={className} style={{ zIndex: 1, position: 'relative' }}>
      {/* VIP Badge */}
      {isVipUser && (
        <div className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          👑 VIP Maps
        </div>
      )}
      
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className={`h-full w-full rounded-lg ${isVipUser ? 'vip-map' : 'standard-map'}`}
        ref={mapRef}
        style={{ zIndex: 1 }}
        zoomControl={false}
      >
        {getTileLayer()}
        <MapController center={center} zoom={zoom} />
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.position.lat, marker.position.lng]}
            icon={getIcon(marker.icon)}
          >
            {marker.popup && (
              <Popup>
                <div className="text-sm">{marker.popup}</div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Type Indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isVipUser ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {isVipUser ? 'VIP Enhanced Maps' : 'Standard Maps'}
          </span>
        </div>
      </div>
    </div>
  );
}
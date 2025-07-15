import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    popup?: string;
    icon?: 'start' | 'end' | 'current';
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  onRouteUpdate?: (route: google.maps.DirectionsResult) => void;
  showRoute?: boolean;
  destination?: { lat: number; lng: number };
}

export function GoogleMap({ 
  center, 
  zoom = 13, 
  markers = [], 
  onMapClick, 
  className = "h-full w-full",
  onRouteUpdate,
  showRoute = false,
  destination
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyBGne_b-3mVHfAnpI9D6aAFuHiigAfCiDg", // Tu API key
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        await loader.load();
        
        if (!mapRef.current) return;

        // Crear mapa
        const map = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Servicios de direcciones
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          draggable: true,
          panel: undefined,
        });
        directionsRendererRef.current.setMap(map);

        // Click en el mapa
        if (onMapClick) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Error cargando Google Maps');
      }
    };

    initMap();
  }, []);

  // Actualizar centro del mapa
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center, isLoaded]);

  // Actualizar marcadores
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Agregar nuevos marcadores
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.popup,
        icon: getMarkerIcon(markerData.icon),
      });

      if (markerData.popup) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.popup,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, isLoaded]);

  // Mostrar ruta
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !showRoute || !destination) return;
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;

    const request: google.maps.DirectionsRequest = {
      origin: center,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false,
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRendererRef.current?.setDirections(result);
        if (onRouteUpdate) {
          onRouteUpdate(result);
        }
      }
    });
  }, [center, destination, showRoute, isLoaded, onRouteUpdate]);

  const getMarkerIcon = (iconType?: 'start' | 'end' | 'current') => {
    const baseUrl = 'http://maps.google.com/mapfiles/ms/icons/';
    switch (iconType) {
      case 'start':
        return `${baseUrl}green-dot.png`;
      case 'end':
        return `${baseUrl}red-dot.png`;
      case 'current':
        return `${baseUrl}blue-dot.png`;
      default:
        return undefined;
    }
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <div className="text-center p-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ zIndex: 1, position: 'relative' }}>
      {/* VIP Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
        👑 Google Maps VIP
      </div>
      
      <div ref={mapRef} className="h-full w-full rounded-lg" />
    </div>
  );
}
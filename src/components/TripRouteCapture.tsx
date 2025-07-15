import React, { useEffect, useRef } from 'react';

interface TripRouteCaptureProps {
  isActive: boolean;
  onRouteUpdate: (routePoint: { lat: number; lng: number; timestamp: Date }) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function TripRouteCapture({ isActive, onRouteUpdate, userLocation }: TripRouteCaptureProps) {
  const routePointsRef = useRef<Array<{ lat: number; lng: number; timestamp: Date }>>([]);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isActive || !userLocation) return;

    // Verificar si la posición ha cambiado significativamente
    const hasMovedSignificantly = () => {
      if (!lastPositionRef.current) return true;
      
      const distance = calculateDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        userLocation.lat,
        userLocation.lng
      );
      
      // Solo guardar si se ha movido más de 10 metros
      return distance > 0.01; // ~10 metros
    };

    if (hasMovedSignificantly()) {
      const routePoint = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        timestamp: new Date()
      };

      routePointsRef.current.push(routePoint);
      lastPositionRef.current = userLocation;
      onRouteUpdate(routePoint);
    }
  }, [isActive, userLocation, onRouteUpdate]);

  // Limpiar ruta cuando se inicia un nuevo viaje
  useEffect(() => {
    if (isActive) {
      routePointsRef.current = [];
      lastPositionRef.current = null;
    }
  }, [isActive]);

  return null; // Este componente no renderiza nada visible
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
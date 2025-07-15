import { useState, useEffect, useRef } from 'react';
import { FareCategory } from '../types';
import { calculateDistance } from '../utils/calculations';

interface TaximeterState {
  totalCost: number;
  distance: number;
  duration: number;
  isMoving: boolean;
  currentSpeed: number;
  lastPosition: { lat: number; lng: number } | null;
  distanceCost: number;
  timeCost: number;
  basicFare: number;
}

interface UseTaximeterProps {
  fareCategory: FareCategory;
  dynamicMultiplier: number;
  isActive: boolean;
  currentPosition: { lat: number; lng: number } | null;
}

export function useTaximeter({ 
  fareCategory, 
  dynamicMultiplier, 
  isActive, 
  currentPosition 
}: UseTaximeterProps) {
  const [state, setState] = useState<TaximeterState>({
    totalCost: fareCategory.basicFare,
    distance: 0,
    duration: 0,
    isMoving: false,
    currentSpeed: 0,
    lastPosition: null,
    distanceCost: 0,
    timeCost: 0,
    basicFare: fareCategory.basicFare,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const speedHistoryRef = useRef<number[]>([]);

  // Detectar si el vehículo se está moviendo
  const detectMovement = (speed: number): boolean => {
    // Agregar velocidad al historial (últimos 3 puntos)
    speedHistoryRef.current.push(speed);
    if (speedHistoryRef.current.length > 3) {
      speedHistoryRef.current.shift();
    }

    // Considerar movimiento si la velocidad promedio es > 2 km/h
    const avgSpeed = speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length;
    return avgSpeed > 2; // 2 km/h = ~0.56 m/s
  };

  // Calcular velocidad entre dos puntos
  const calculateSpeed = (
    pos1: { lat: number; lng: number },
    pos2: { lat: number; lng: number },
    timeElapsed: number // en segundos
  ): number => {
    if (timeElapsed === 0) return 0;
    
    const distance = calculateDistance(pos1.lat, pos1.lng, pos2.lat, pos2.lng);
    const distanceInMeters = distance * 1000;
    const speedMps = distanceInMeters / timeElapsed; // metros por segundo
    const speedKmh = speedMps * 3.6; // convertir a km/h
    
    return speedKmh;
  };

  // Actualizar posición y calcular métricas
  useEffect(() => {
    if (!isActive || !currentPosition) return;

    const now = Date.now();
    const timeElapsed = (now - lastUpdateRef.current) / 1000; // segundos

    if (state.lastPosition && timeElapsed > 0) {
      // Calcular distancia recorrida
      const distanceTraveled = calculateDistance(
        state.lastPosition.lat,
        state.lastPosition.lng,
        currentPosition.lat,
        currentPosition.lng
      );

      // Calcular velocidad actual
      const currentSpeed = calculateSpeed(
        state.lastPosition,
        currentPosition,
        timeElapsed
      );

      // Detectar si se está moviendo
      const isMoving = detectMovement(currentSpeed);

      setState(prev => ({
        ...prev,
        distance: prev.distance + (isMoving ? distanceTraveled : 0), // Solo agregar distancia si se está moviendo
        currentSpeed,
        isMoving,
        lastPosition: currentPosition,
      }));
    } else if (!state.lastPosition) {
      // Primera posición
      setState(prev => ({
        ...prev,
        lastPosition: currentPosition,
      }));
    }

    lastUpdateRef.current = now;
  }, [currentPosition, isActive]);

  // Timer principal del taxímetro - ACTUALIZA CADA SEGUNDO
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const newDuration = prev.duration + 1; // +1 segundo
        
        // SIEMPRE agregar costo por tiempo (cada segundo que pasa)
        const timeIncrement = fareCategory.costPerMinute / 60; // costo por segundo
        const newTimeCost = prev.timeCost + timeIncrement;

        // El costo por distancia se calcula en base a la distancia total acumulada
        const newDistanceCost = prev.distance * fareCategory.costPerKm;

        // Calcular total en tiempo real
        const subtotal = prev.basicFare + newDistanceCost + newTimeCost;
        const totalWithMultiplier = Math.max(subtotal, fareCategory.minimumFare) * dynamicMultiplier;
        
        // Redondear según decimales configurados
        const totalCost = Math.round(totalWithMultiplier * Math.pow(10, fareCategory.decimalDigits)) / Math.pow(10, fareCategory.decimalDigits);

        return {
          ...prev,
          duration: newDuration,
          timeCost: newTimeCost,
          distanceCost: newDistanceCost,
          totalCost,
        };
      });
    }, 1000); // Actualizar cada segundo

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, fareCategory, dynamicMultiplier]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset cuando se inicia un nuevo viaje
  const reset = () => {
    setState({
      totalCost: fareCategory.basicFare,
      distance: 0,
      duration: 0,
      isMoving: false,
      currentSpeed: 0,
      lastPosition: null,
      distanceCost: 0,
      timeCost: 0,
      basicFare: fareCategory.basicFare,
    });
    speedHistoryRef.current = [];
    lastUpdateRef.current = Date.now();
  };

  return {
    ...state,
    reset,
  };
}
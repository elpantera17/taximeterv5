import { useState, useEffect } from 'react';

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
  accuracy: number | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
    accuracy: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: 'Geolocation is not supported by this browser',
        loading: false,
        accuracy: null,
      });
      return;
    }

    // Primero intentar obtener la posición desde caché si está disponible
    const getCachedPosition = () => {
      const cached = localStorage.getItem('pantera-last-position');
      if (cached) {
        try {
          const { position, timestamp } = JSON.parse(cached);
          // Si la posición tiene menos de 5 minutos, usarla temporalmente
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setState(prev => ({
              ...prev,
              position: position,
              loading: true, // Seguir cargando para obtener posición actual
            }));
            return position;
          }
        } catch (error) {
          console.error('Error parsing cached position:', error);
        }
      }
      return null;
    };

    // Intentar usar posición en caché primero
    getCachedPosition();

    const success = (position: GeolocationPosition) => {
      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setState({
        position: newPosition,
        error: null,
        loading: false,
        accuracy: position.coords.accuracy,
      });

      // Guardar en caché
      localStorage.setItem('pantera-last-position', JSON.stringify({
        position: newPosition,
        timestamp: Date.now(),
      }));
    };

    const error = (error: GeolocationPositionError) => {
      let errorMessage = 'Error obteniendo ubicación';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Información de ubicación no disponible.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Tiempo de espera agotado obteniendo ubicación.';
          break;
      }

      setState({
        position: null,
        error: errorMessage,
        loading: false,
        accuracy: null,
      });
    };

    // Configuración optimizada para obtener ubicación rápida
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 segundos
      maximumAge: 60000, // Aceptar posición de hasta 1 minuto
    };

    // Primero intentar obtener una posición rápida con menor precisión
    navigator.geolocation.getCurrentPosition(
      success,
      () => {
        // Si falla la primera vez, intentar con configuración menos estricta
        const fallbackOptions: PositionOptions = {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000, // 5 minutos
        };
        
        navigator.geolocation.getCurrentPosition(success, error, fallbackOptions);
      },
      options
    );

    // También configurar watchPosition para actualizaciones continuas
    const watchId = navigator.geolocation.watchPosition(
      success,
      (watchError) => {
        // Solo mostrar error si no tenemos ninguna posición
        if (!state.position) {
          error(watchError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
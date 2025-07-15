import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Menu, TrendingUp, Navigation, MapPin, Loader2, Share2 } from 'lucide-react';
import { Map } from '../components/Map';
import { GoogleMap } from '../components/GoogleMap';
import { LocationSearch } from '../components/LocationSearch';
import { GooglePlacesSearch } from '../components/GooglePlacesSearch';
import { DynamicPricingModal } from '../components/DynamicPricingModal';
import { TripCompletionModal } from '../components/TripCompletionModal';
import { TripRouteCapture } from '../components/TripRouteCapture';
import { TripShareModal } from '../components/TripShareModal';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTaximeter } from '../hooks/useTaximeter';
import { formatCurrency, formatDuration } from '../utils/calculations';
import { GeocodeResult } from '../services/geocoding';

export function Home() {
  const { state, dispatch } = useApp();
  const { state: authState } = useAuth();
  const { position, loading: geoLoading, error: geoError, accuracy } = useGeolocation();
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showDynamicModal, setShowDynamicModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedTrip, setCompletedTrip] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number; timestamp: Date }>>([]);

  const activeFare = state.fareCategories.find(f => f.isActive) || state.fareCategories[0];
  const isTripping = state.currentTrip?.status === 'active';
  const currentUser = authState.currentUser;

  // Determinar si usar Google Maps (VIP/Admin) o OpenStreetMap (Normal)
  const useGoogleMaps = currentUser && ['vip', 'vip2', 'vip3', 'vip4', 'admin'].includes(currentUser.role);

  // Hook del taxímetro en tiempo real
  const taximeter = useTaximeter({
    fareCategory: activeFare,
    dynamicMultiplier: state.settings.dynamicMultiplier,
    isActive: isTripping,
    currentPosition: position,
  });

  // Actualizar el viaje actual con los datos del taxímetro en tiempo real
  useEffect(() => {
    if (isTripping && state.currentTrip) {
      const updatedTrip = {
        ...state.currentTrip,
        distance: taximeter.distance,
        duration: taximeter.duration,
        totalCost: taximeter.totalCost,
        route: routePoints.map(point => ({ lat: point.lat, lng: point.lng }))
      };
      dispatch({ type: 'SET_CURRENT_TRIP', payload: updatedTrip });
    }
  }, [taximeter.totalCost, taximeter.distance, taximeter.duration, isTripping, routePoints]);

  const handleLocationSelect = (location: GeocodeResult) => {
    // Calcular estimación basada en la distancia real del geocoding
    const distance = location.distance ? parseFloat(location.distance.replace(' km', '')) : 5;
    const estimatedDuration = distance * 120; // 2 minutos por km (estimación)
    
    // Cálculo de estimación
    const estimatedDistanceCost = distance * activeFare.costPerKm;
    const estimatedTimeCost = (estimatedDuration / 60) * activeFare.costPerMinute * 0.3; // 30% del tiempo estimado parado
    const subtotal = activeFare.basicFare + estimatedDistanceCost + estimatedTimeCost;
    const fare = Math.max(subtotal, activeFare.minimumFare) * state.settings.dynamicMultiplier;
    
    setEstimatedFare(Math.round(fare * Math.pow(10, activeFare.decimalDigits)) / Math.pow(10, activeFare.decimalDigits));
    setDestination(location.name);
    setDestinationCoords({ lat: location.lat, lng: location.lng });
    setShowSearch(false);
  };

  const handleGooglePlaceSelect = (place: google.maps.places.PlaceResult, estimatedFare?: number) => {
    if (!place.geometry?.location) return;
    
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    setDestination(place.name || place.formatted_address || '');
    setDestinationCoords({ lat, lng });
    
    if (estimatedFare !== undefined) {
      setEstimatedFare(estimatedFare);
    }
    
    setShowSearch(false);
  };

  const handleStartTrip = () => {
    if (!position || isTripping) return;

    const newTrip = {
      id: Date.now().toString(),
      startTime: new Date(),
      startLocation: {
        lat: position.lat,
        lng: position.lng,
        address: 'Ubicación actual',
      },
      distance: 0,
      duration: 0,
      totalCost: activeFare.basicFare,
      fareCategory: activeFare,
      dynamicMultiplier: state.settings.dynamicMultiplier,
      status: 'active' as const,
      route: []
    };

    dispatch({ type: 'SET_CURRENT_TRIP', payload: newTrip });
    setRoutePoints([]);
    taximeter.reset();
  };

  const handleEndTrip = () => {
    setShowConfirmEnd(true);
  };

  const handleConfirmEndTrip = () => {
    if (!state.currentTrip || !position) return;

    const completedTrip = {
      ...state.currentTrip,
      endTime: new Date(),
      endLocation: {
        lat: destinationCoords?.lat || position.lat,
        lng: destinationCoords?.lng || position.lng,
        address: destination || 'Destino',
      },
      distance: taximeter.distance,
      duration: taximeter.duration,
      totalCost: taximeter.totalCost,
      status: 'completed' as const,
      route: routePoints.map(point => ({ lat: point.lat, lng: point.lng }))
    };

    setShowConfirmEnd(false);
    setShowCompletionModal(true);
    setCompletedTrip(completedTrip);
    
    // Guardar el viaje completado temporalmente para el modal
    dispatch({ type: 'SET_CURRENT_TRIP', payload: completedTrip });
  };

  const handleTripCompleted = (finalTrip: any) => {
    dispatch({ type: 'ADD_TRIP', payload: finalTrip });
    dispatch({ type: 'SET_CURRENT_TRIP', payload: null });
    setShowCompletionModal(false);
    setEstimatedFare(null);
    setDestination('');
    setDestinationCoords(null);
    setRoutePoints([]);
  };

  const handleMenuToggle = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const handleDynamicChange = (multiplier: number) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { dynamicMultiplier: multiplier }
    });
    setShowDynamicModal(false);
  };

  const handleRouteUpdate = (routePoint: { lat: number; lng: number; timestamp: Date }) => {
    setRoutePoints(prev => [...prev, routePoint]);
  };

  const handleShareTrip = () => {
    if (completedTrip) {
      setShowShareModal(true);
    }
  };

  // Usar coordenadas por defecto más cercanas a República Dominicana
  const defaultCenter = { lat: 18.4861, lng: -69.9312 }; // Santo Domingo, RD
  const mapCenter = position || defaultCenter;
  
  const markers = [];
  
  if (position) {
    markers.push({
      position: position,
      popup: 'Tu ubicación actual',
      icon: 'current' as const,
    });
  }
  
  if (destinationCoords) {
    markers.push({
      position: destinationCoords,
      popup: destination,
      icon: 'end' as const,
    });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="relative z-[1000] bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMenuToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Pantera Taximeter
            </h1>
          </div>
          
          {/* GPS Status Indicator */}
          <div className="flex items-center space-x-2">
            {geoLoading ? (
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Ubicando...</span>
              </div>
            ) : geoError ? (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Sin GPS</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  GPS {accuracy && accuracy < 50 ? 'Preciso' : 'Activo'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Container */}
        <div className="absolute inset-0 z-[1]">
          {geoError ? (
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Error de ubicación
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                  {geoError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : useGoogleMaps ? (
            <GoogleMap
              center={mapCenter}
              markers={markers}
              className="h-full w-full"
              showRoute={isTripping && destinationCoords !== null}
              destination={destinationCoords || undefined}
            />
          ) : (
            <Map
              center={mapCenter}
              markers={markers}
              className="h-full w-full"
            />
          )}
          
          {/* Loading overlay when getting initial location */}
          {geoLoading && !position && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[500]">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-900 dark:text-white font-medium mb-1">
                  Obteniendo tu ubicación
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Esto puede tomar unos segundos...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Fare Display - Solo cuando hay viaje activo */}
        {isTripping && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[900]">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full px-8 py-4 shadow-2xl border-4 border-white dark:border-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1 font-mono">
                  {formatCurrency(taximeter.totalCost, activeFare.currencySymbol, activeFare.decimalDigits)}
                </div>
                <div className="flex items-center justify-center space-x-4 text-blue-100 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${taximeter.isMoving ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                    <span>{taximeter.isMoving ? 'En movimiento' : 'Detenido'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Navigation className="w-3 h-3" />
                    <span>{taximeter.currentSpeed.toFixed(0)} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="absolute top-4 left-4 right-4 z-[900]">
          <button
            onClick={() => setShowSearch(true)}
            disabled={isTripping}
            className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex items-center space-x-3 text-left border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-xl">🔍</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                {destination || '¿Para dónde vamos?'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {destination ? 'Toca para cambiar destino' : 'Buscar cualquier lugar en el mapa'}
              </div>
            </div>
          </button>
        </div>

        {/* Trip Status */}
        {isTripping && (
          <div className="absolute top-32 left-4 right-4 z-[900]">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">Viaje en curso</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatDuration(taximeter.duration)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-green-100">
                <div>
                  <div className="font-medium">{taximeter.distance.toFixed(2)} km</div>
                  <div className="text-xs">Distancia</div>
                </div>
                <div>
                  <div className="font-medium">{taximeter.currentSpeed.toFixed(0)} km/h</div>
                  <div className="text-xs">Velocidad</div>
                </div>
                <div>
                  <div className="font-medium">{state.settings.dynamicMultiplier}x</div>
                  <div className="text-xs">Multiplicador</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls Panel */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-2xl rounded-t-3xl">
          <div className="p-6 space-y-4">
            {/* Fare Info */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tarifa activa</div>
                <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{activeFare.name}</div>
              </div>
              {state.settings.dynamicMultiplier > 1.0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Multiplicador</div>
                  <div className="font-bold text-lg text-orange-600 dark:text-orange-400">
                    {state.settings.dynamicMultiplier}x
                  </div>
                </div>
              )}
            </div>

            {/* Real-time breakdown when trip is active */}
            {isTripping && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Desglose en tiempo real
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tarifa básica:</span>
                    <span className="font-medium">
                      {formatCurrency(taximeter.basicFare, activeFare.currencySymbol, activeFare.decimalDigits)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Por tiempo:</span>
                    <span className="font-medium">
                      {formatCurrency(taximeter.timeCost, activeFare.currencySymbol, activeFare.decimalDigits)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Por distancia:</span>
                    <span className="font-medium">
                      {formatCurrency(taximeter.distanceCost, activeFare.currencySymbol, activeFare.decimalDigits)}
                    </span>
                  </div>
                  {state.settings.dynamicMultiplier > 1.0 && (
                    <div className="flex justify-between">
                      <span className="text-orange-600 dark:text-orange-400">Multiplicador ({state.settings.dynamicMultiplier}x):</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        +{formatCurrency(
                          taximeter.totalCost - (taximeter.basicFare + taximeter.timeCost + taximeter.distanceCost),
                          activeFare.currencySymbol,
                          activeFare.decimalDigits
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estimated Fare */}
            {estimatedFare !== null && !isTripping && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Tarifa estimada</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {destination && `Hacia: ${destination.substring(0, 30)}${destination.length > 30 ? '...' : ''}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                      {formatCurrency(estimatedFare, activeFare.currencySymbol, activeFare.decimalDigits)}
                    </div>
                    {state.settings.dynamicMultiplier > 1.0 && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Incluye multiplicador {state.settings.dynamicMultiplier}x
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 pb-2">
              {/* Dynamic Pricing Button */}
              <button
                onClick={() => setShowDynamicModal(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm transition-all transform hover:scale-105 active:scale-95"
              >
                <TrendingUp className="w-4 h-4" />
                <span>DINÁMICA</span>
              </button>

              {/* Main Action Button */}
              {!isTripping ? (
                <button
                  onClick={handleStartTrip}
                  disabled={!position}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm transition-all transform hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  <span>INICIAR VIAJE</span>
                </button>
              ) : (
                <button
                  onClick={handleEndTrip}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm transition-all transform hover:scale-105 active:scale-95"
                >
                  <Square className="w-4 h-4" />
                  <span>FINALIZAR VIAJE</span>
                </button>
              )}

              {/* Share Button - Only visible for completed trips */}
              {completedTrip && (
                <button
                  onClick={handleShareTrip}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm transition-all transform hover:scale-105 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>COMPARTIR</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Route Capture Component */}
      <TripRouteCapture 
        isActive={isTripping} 
        onRouteUpdate={handleRouteUpdate}
        userLocation={position}
      />

      {/* Location Search Modal */}
      {showSearch && (
        useGoogleMaps ? (
          <GooglePlacesSearch
            value={destination}
            onChange={setDestination}
            onSelect={handleGooglePlaceSelect}
            onClose={() => setShowSearch(false)}
            placeholder="¿Para dónde vamos?"
            userLocation={position}
            fareCategory={activeFare}
            dynamicMultiplier={state.settings.dynamicMultiplier}
            onDynamicChange={handleDynamicChange}
          />
        ) : (
          <LocationSearch
            value={destination}
            onChange={setDestination}
            onSelect={handleLocationSelect}
            onClose={() => setShowSearch(false)}
            placeholder="¿Para dónde vamos?"
            userLocation={position}
          />
        )
      )}

      {/* Dynamic Pricing Modal */}
      {showDynamicModal && (
        <DynamicPricingModal
          currentMultiplier={state.settings.dynamicMultiplier}
          onApply={handleDynamicChange}
          onClose={() => setShowDynamicModal(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Cerrar el viaje?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Esta acción terminará el viaje, no es posible deshacer esta acción.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmEnd(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  NO
                </button>
                <button
                  onClick={handleConfirmEndTrip}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  SÍ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Completion Modal */}
      {showCompletionModal && state.currentTrip && (
        <TripCompletionModal
          trip={state.currentTrip}
          onComplete={handleTripCompleted}
          onClose={() => setShowCompletionModal(false)}
        />
      )}

      {/* Trip Share Modal */}
      {showShareModal && completedTrip && (
        <TripShareModal
          trip={completedTrip}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
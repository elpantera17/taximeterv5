import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, MapPin, Clock, X, TrendingUp, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { geocodeSearch, searchNearbyPlaces, GeocodeResult } from '../services/geocoding';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: GeocodeResult) => void;
  onClose: () => void;
  placeholder?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export function LocationSearch({ 
  value, 
  onChange, 
  onSelect, 
  onClose, 
  placeholder = "¿Para dónde vamos?",
  userLocation 
}: LocationSearchProps) {
  const { state, dispatch } = useApp();
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [tempMultiplier, setTempMultiplier] = useState(state.settings.dynamicMultiplier);
  const [loading, setLoading] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<GeocodeResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeFare = state.fareCategories.find(f => f.isActive) || state.fareCategories[0];

  // Cargar lugares cercanos al abrir el modal
  useEffect(() => {
    if (userLocation && nearbyPlaces.length === 0) {
      searchNearbyPlaces(userLocation).then(places => {
        setNearbyPlaces(places);
      }).catch(error => {
        console.error('Error cargando lugares cercanos:', error);
        // Silently fail for nearby places to not disrupt user experience
      });
    }
  }, [userLocation]);

  // Calcular precio estimado
  const calculateEstimatedFare = (location: GeocodeResult, multiplier: number) => {
    const distance = location.distance ? parseFloat(location.distance.replace(' km', '')) : 5;
    const estimatedDuration = distance * 120; // 2 minutos por km
    
    const estimatedDistanceCost = distance * activeFare.costPerKm;
    const estimatedTimeCost = (estimatedDuration / 60) * activeFare.costPerMinute * 0.3;
    const subtotal = activeFare.basicFare + estimatedDistanceCost + estimatedTimeCost;
    const fare = Math.max(subtotal, activeFare.minimumFare) * multiplier;
    
    return Math.round(fare * Math.pow(10, activeFare.decimalDigits)) / Math.pow(10, activeFare.decimalDigits);
  };

  // Búsqueda con debounce optimizado
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length > 2) {
      setLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await geocodeSearch(value, userLocation || undefined, 15); // Aumentado a 15
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error en búsqueda:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 800); // Reducido a 800ms para mejor experiencia
    } else if (value.length === 0) {
      // Mostrar lugares cercanos cuando no hay texto
      setSuggestions(nearbyPlaces);
      setShowSuggestions(true);
      setLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, userLocation, nearbyPlaces]);

  useEffect(() => {
    if (selectedLocation) {
      const fare = calculateEstimatedFare(selectedLocation, tempMultiplier);
      setEstimatedFare(fare);
    }
  }, [selectedLocation, tempMultiplier, activeFare]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedLocation(null);
    setEstimatedFare(null);
  };

  const handleSuggestionClick = (suggestion: GeocodeResult) => {
    setSelectedLocation(suggestion);
    onChange(suggestion.name);
    setShowSuggestions(false);
    
    // Calcular precio estimado
    const fare = calculateEstimatedFare(suggestion, tempMultiplier);
    setEstimatedFare(fare);
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      // Aplicar el multiplicador temporal si cambió
      if (tempMultiplier !== state.settings.dynamicMultiplier) {
        dispatch({
          type: 'UPDATE_SETTINGS',
          payload: { dynamicMultiplier: tempMultiplier }
        });
      }
      onSelect(selectedLocation);
    }
  };

  const getIconForType = (type: GeocodeResult['type']) => {
    switch (type) {
      case 'airport':
        return '✈️';
      case 'mall':
        return '🏬';
      case 'restaurant':
        return '🍽️';
      case 'hotel':
        return '🏨';
      case 'hospital':
        return '🏥';
      case 'address':
        return '🏠';
      case 'poi':
        return '📍';
      default:
        return '📍';
    }
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier === 1.0) return 'text-green-600 dark:text-green-400';
    if (multiplier <= 1.5) return 'text-yellow-600 dark:text-yellow-400';
    if (multiplier <= 2.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-start justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg mx-4 mt-20 w-full max-w-md shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Buscar destino
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
              autoFocus
            />
            {value && (
              <button
                onClick={() => {
                  onChange('');
                  setSelectedLocation(null);
                  setEstimatedFare(null);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Estimated Fare and Dynamic Pricing */}
        {selectedLocation && estimatedFare !== null && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Precio estimado</div>
                <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  {formatCurrency(estimatedFare, activeFare.currencySymbol, activeFare.decimalDigits)}
                </div>
                {selectedLocation.distance && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Distancia: {selectedLocation.distance}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Multiplicador</div>
                <div className={`font-bold text-lg ${getMultiplierColor(tempMultiplier)}`}>
                  {tempMultiplier.toFixed(1)}x
                </div>
              </div>
            </div>
            
            {/* Dynamic Multiplier Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ajustar tarifa dinámica:</span>
                <button
                  onClick={() => setTempMultiplier(1.0)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Resetear
                </button>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {[1.0, 1.2, 1.5, 2.0, 2.5, 3.0].map((multiplier) => (
                  <button
                    key={multiplier}
                    onClick={() => setTempMultiplier(multiplier)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      tempMultiplier === multiplier
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {multiplier.toFixed(1)}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="max-h-96 overflow-y-auto">
          {loading && value.length > 2 ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Buscando ubicaciones...</p>
            </div>
          ) : showSuggestions && suggestions.length > 0 ? (
            <div className="py-2">
              {value.length === 0 && suggestions.length > 0 && (
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {userLocation ? 'Lugares cercanos' : 'Destinos populares'}
                    </span>
                  </div>
                </div>
              )}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    selectedLocation?.id === suggestion.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-xl mt-1">
                      {getIconForType(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {suggestion.address}
                      </div>
                    </div>
                    {suggestion.distance && (
                      <div className="text-sm text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {suggestion.distance}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : value.length > 2 && !loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron ubicaciones</p>
              <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : value.length > 0 && value.length <= 2 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Escribe al menos 3 caracteres</p>
              <p className="text-sm mt-1">para buscar ubicaciones</p>
            </div>
          ) : null}
        </div>

        {/* Confirm Button */}
        {selectedLocation && estimatedFare !== null && (
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={handleConfirmSelection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Confirmar destino</span>
              <span className="font-bold">
                {formatCurrency(estimatedFare, activeFare.currencySymbol, activeFare.decimalDigits)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
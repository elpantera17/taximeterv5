import React, { useEffect, useRef, useState } from 'react';
import { Search, Navigation, MapPin, X, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface GooglePlacesSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: google.maps.places.PlaceResult, estimatedFare?: number) => void;
  onClose: () => void;
  placeholder?: string;
  userLocation?: { lat: number; lng: number } | null;
  fareCategory: any;
  dynamicMultiplier: number;
  onDynamicChange: (multiplier: number) => void;
}

export function GooglePlacesSearch({ 
  value, 
  onChange, 
  onSelect, 
  onClose, 
  placeholder = "¿Para dónde vamos?",
  userLocation,
  fareCategory,
  dynamicMultiplier,
  onDynamicChange
}: GooglePlacesSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [tempMultiplier, setTempMultiplier] = useState(dynamicMultiplier);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    // Inicializar servicios
    serviceRef.current = new google.maps.places.AutocompleteService();
    
    // Crear un div temporal para PlacesService
    const tempDiv = document.createElement('div');
    placesServiceRef.current = new google.maps.places.PlacesService(tempDiv);

    // Configurar autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'do' }, // República Dominicana
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.geometry) {
        handlePlaceSelect(place);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!serviceRef.current || value.length < 3) {
      setPredictions([]);
      return;
    }

    const request = {
      input: value,
      componentRestrictions: { country: 'do' },
      types: ['establishment', 'geocode']
    };

    serviceRef.current.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setPredictions(predictions.slice(0, 8));
      } else {
        setPredictions([]);
      }
    });
  }, [value]);

  const calculateEstimatedFare = (distance: number, duration: number, multiplier: number) => {
    const estimatedDistanceCost = distance * fareCategory.costPerKm;
    const estimatedTimeCost = (duration / 60) * fareCategory.costPerMinute;
    const subtotal = fareCategory.basicFare + estimatedDistanceCost + estimatedTimeCost;
    const fare = Math.max(subtotal, fareCategory.minimumFare) * multiplier;
    
    return Math.round(fare * Math.pow(10, fareCategory.decimalDigits)) / Math.pow(10, fareCategory.decimalDigits);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !userLocation) return;

    const destination = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    // Calcular distancia y tiempo estimado usando Google Maps
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [userLocation],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    }, (response, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK && response) {
        const element = response.rows[0].elements[0];
        if (element.status === 'OK') {
          const distance = element.distance.value / 1000; // metros a km
          const duration = element.duration.value; // segundos
          
          const fare = calculateEstimatedFare(distance, duration, tempMultiplier);
          setEstimatedFare(fare);
          setSelectedPlace(place);
          onChange(place.name || place.formatted_address || '');
        }
      }
    });
  };

  const handlePredictionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails({
      placeId: prediction.place_id,
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types']
    }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        handlePlaceSelect(place);
      }
    });
  };

  const handleConfirmSelection = () => {
    if (selectedPlace && estimatedFare !== null) {
      onDynamicChange(tempMultiplier);
      onSelect(selectedPlace, estimatedFare);
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
              Buscar destino (Google Maps)
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
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
              autoFocus
            />
            {value && (
              <button
                onClick={() => {
                  onChange('');
                  setSelectedPlace(null);
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
        {selectedPlace && estimatedFare !== null && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Precio estimado (Google Maps)</div>
                <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  {formatCurrency(estimatedFare, fareCategory.currencySymbol, fareCategory.decimalDigits)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedPlace.name || selectedPlace.formatted_address}
                </div>
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

        {/* Predictions */}
        <div className="max-h-96 overflow-y-auto">
          {predictions.length > 0 && (
            <div className="py-2">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePredictionClick(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        {selectedPlace && estimatedFare !== null && (
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={handleConfirmSelection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Confirmar destino</span>
              <span className="font-bold">
                {formatCurrency(estimatedFare, fareCategory.currencySymbol, fareCategory.decimalDigits)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
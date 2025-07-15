export interface GeocodeResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: string;
  type: 'airport' | 'mall' | 'restaurant' | 'hotel' | 'hospital' | 'general' | 'address' | 'poi';
  importance?: number;
}

export interface ReverseGeocodeResult {
  address: string;
  lat: number;
  lng: number;
}

// Rate limiting utility
class RateLimiter {
  private lastRequestTime = 0;
  private minInterval = 1000; // Reducido a 1 segundo

  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter();

// Datos mock expandidos para mejor cobertura
const mockPlaces: GeocodeResult[] = [
  // Aeropuertos
  {
    id: 'mock_1',
    name: 'Aeropuerto Internacional Las Américas',
    address: 'Aeropuerto Internacional Las Américas, Santo Domingo Este, República Dominicana',
    lat: 18.4297,
    lng: -69.6689,
    type: 'airport',
    importance: 0.9
  },
  {
    id: 'mock_2',
    name: 'Aeropuerto Internacional Gregorio Luperón',
    address: 'Puerto Plata, República Dominicana',
    lat: 19.7579,
    lng: -70.5700,
    type: 'airport',
    importance: 0.8
  },
  // Centros comerciales
  {
    id: 'mock_3',
    name: 'Centro Comercial Agora Mall',
    address: 'Av. John F. Kennedy, Santo Domingo, República Dominicana',
    lat: 18.4861,
    lng: -69.9312,
    type: 'mall',
    importance: 0.8
  },
  {
    id: 'mock_4',
    name: 'Blue Mall',
    address: 'Av. Winston Churchill, Santo Domingo, República Dominicana',
    lat: 18.4756,
    lng: -69.9441,
    type: 'mall',
    importance: 0.8
  },
  {
    id: 'mock_5',
    name: 'Sambil Santo Domingo',
    address: 'Av. John F. Kennedy, Santo Domingo, República Dominicana',
    lat: 18.4889,
    lng: -69.9312,
    type: 'mall',
    importance: 0.7
  },
  // Hospitales
  {
    id: 'mock_6',
    name: 'Hospital General Plaza de la Salud',
    address: 'Av. Ortega y Gasset, Santo Domingo, República Dominicana',
    lat: 18.4655,
    lng: -69.9445,
    type: 'hospital',
    importance: 0.8
  },
  {
    id: 'mock_7',
    name: 'Centro Médico UCE',
    address: 'Av. Máximo Gómez, Santo Domingo, República Dominicana',
    lat: 18.4789,
    lng: -69.9156,
    type: 'hospital',
    importance: 0.7
  },
  {
    id: 'mock_8',
    name: 'Hospital Salvador B. Gautier',
    address: 'Av. Tiradentes, Santo Domingo, República Dominicana',
    lat: 18.4567,
    lng: -69.9234,
    type: 'hospital',
    importance: 0.7
  },
  // Hoteles
  {
    id: 'mock_9',
    name: 'Hotel Sheraton Santo Domingo',
    address: 'Av. George Washington, Santo Domingo, República Dominicana',
    lat: 18.4539,
    lng: -69.9516,
    type: 'hotel',
    importance: 0.7
  },
  {
    id: 'mock_10',
    name: 'Hotel Intercontinental Real Santo Domingo',
    address: 'Av. Máximo Gómez, Santo Domingo, República Dominicana',
    lat: 18.4678,
    lng: -69.9345,
    type: 'hotel',
    importance: 0.7
  },
  {
    id: 'mock_11',
    name: 'Hotel Embajador',
    address: 'Av. Sarasota, Santo Domingo, República Dominicana',
    lat: 18.4723,
    lng: -69.9567,
    type: 'hotel',
    importance: 0.6
  },
  // Restaurantes
  {
    id: 'mock_12',
    name: 'Restaurante Adrian Tropical',
    address: 'Av. George Washington, Santo Domingo, República Dominicana',
    lat: 18.4567,
    lng: -69.9489,
    type: 'restaurant',
    importance: 0.6
  },
  {
    id: 'mock_13',
    name: 'Mesón de Bari',
    address: 'Calle Hostos, Zona Colonial, Santo Domingo',
    lat: 18.4734,
    lng: -69.8845,
    type: 'restaurant',
    importance: 0.6
  },
  {
    id: 'mock_14',
    name: 'La Cassina',
    address: 'Av. Abraham Lincoln, Santo Domingo, República Dominicana',
    lat: 18.4823,
    lng: -69.9234,
    type: 'restaurant',
    importance: 0.5
  },
  // Puntos de interés
  {
    id: 'mock_15',
    name: 'Zona Colonial',
    address: 'Ciudad Colonial, Santo Domingo, República Dominicana',
    lat: 18.4734,
    lng: -69.8845,
    type: 'poi',
    importance: 0.9
  },
  {
    id: 'mock_16',
    name: 'Malecón de Santo Domingo',
    address: 'Av. George Washington, Santo Domingo, República Dominicana',
    lat: 18.4539,
    lng: -69.9516,
    type: 'poi',
    importance: 0.8
  },
  {
    id: 'mock_17',
    name: 'Catedral Primada de América',
    address: 'Calle Arzobispo Meriño, Zona Colonial, Santo Domingo',
    lat: 18.4728,
    lng: -69.8834,
    type: 'poi',
    importance: 0.8
  },
  {
    id: 'mock_18',
    name: 'Alcázar de Colón',
    address: 'Plaza de Armas, Zona Colonial, Santo Domingo',
    lat: 18.4756,
    lng: -69.8823,
    type: 'poi',
    importance: 0.7
  },
  {
    id: 'mock_19',
    name: 'Universidad Autónoma de Santo Domingo',
    address: 'Ciudad Universitaria, Santo Domingo, República Dominicana',
    lat: 18.4896,
    lng: -69.9018,
    type: 'poi',
    importance: 0.7
  },
  {
    id: 'mock_20',
    name: 'Parque Mirador del Este',
    address: 'Santo Domingo Este, República Dominicana',
    lat: 18.4567,
    lng: -69.8234,
    type: 'poi',
    importance: 0.6
  },
  {
    id: 'mock_21',
    name: 'Centro de los Héroes',
    address: 'Av. 27 de Febrero, Santo Domingo, República Dominicana',
    lat: 18.4789,
    lng: -69.9123,
    type: 'poi',
    importance: 0.6
  },
  {
    id: 'mock_22',
    name: 'Jardín Botánico Nacional',
    address: 'Av. República de Colombia, Santo Domingo, República Dominicana',
    lat: 18.4945,
    lng: -69.9567,
    type: 'poi',
    importance: 0.6
  },
  // Direcciones comunes
  {
    id: 'mock_23',
    name: 'Avenida 27 de Febrero',
    address: 'Av. 27 de Febrero, Santo Domingo, República Dominicana',
    lat: 18.4789,
    lng: -69.9123,
    type: 'address',
    importance: 0.5
  },
  {
    id: 'mock_24',
    name: 'Avenida John F. Kennedy',
    address: 'Av. John F. Kennedy, Santo Domingo, República Dominicana',
    lat: 18.4861,
    lng: -69.9312,
    type: 'address',
    importance: 0.5
  },
  {
    id: 'mock_25',
    name: 'Avenida Abraham Lincoln',
    address: 'Av. Abraham Lincoln, Santo Domingo, República Dominicana',
    lat: 18.4823,
    lng: -69.9234,
    type: 'address',
    importance: 0.5
  },
  {
    id: 'mock_26',
    name: 'Avenida Winston Churchill',
    address: 'Av. Winston Churchill, Santo Domingo, República Dominicana',
    lat: 18.4756,
    lng: -69.9441,
    type: 'address',
    importance: 0.5
  },
  {
    id: 'mock_27',
    name: 'Avenida Máximo Gómez',
    address: 'Av. Máximo Gómez, Santo Domingo, República Dominicana',
    lat: 18.4678,
    lng: -69.9345,
    type: 'address',
    importance: 0.5
  },
  {
    id: 'mock_28',
    name: 'Avenida George Washington',
    address: 'Av. George Washington, Santo Domingo, República Dominicana',
    lat: 18.4539,
    lng: -69.9516,
    type: 'address',
    importance: 0.5
  }
];

// Función para calcular distancia entre dos puntos
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

// Función para determinar el tipo de lugar basado en las etiquetas
function getPlaceType(tags: any, category: string): GeocodeResult['type'] {
  if (tags.aeroway || category.includes('airport') || tags.amenity === 'airport') return 'airport';
  if (tags.shop === 'mall' || tags.amenity === 'marketplace' || category.includes('mall')) return 'mall';
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food') return 'restaurant';
  if (tags.tourism === 'hotel' || tags.amenity === 'hotel') return 'hotel';
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'hospital';
  if (tags.highway || tags.addr) return 'address';
  return 'general';
}

// Función mejorada para filtrar lugares mock basado en la consulta
function searchMockPlaces(query: string, userLocation?: { lat: number; lng: number }): GeocodeResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Búsqueda más flexible
  let filteredPlaces = mockPlaces.filter(place => {
    const nameMatch = place.name.toLowerCase().includes(normalizedQuery);
    const addressMatch = place.address.toLowerCase().includes(normalizedQuery);
    
    // Búsqueda por palabras individuales
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2);
    const wordMatch = queryWords.some(word => 
      place.name.toLowerCase().includes(word) || 
      place.address.toLowerCase().includes(word)
    );
    
    return nameMatch || addressMatch || wordMatch;
  });

  // Si hay muy pocos resultados, mostrar lugares populares
  if (filteredPlaces.length < 5) {
    const popularPlaces = mockPlaces
      .filter(place => place.importance && place.importance > 0.6)
      .slice(0, 10 - filteredPlaces.length);
    
    // Evitar duplicados
    popularPlaces.forEach(place => {
      if (!filteredPlaces.find(fp => fp.id === place.id)) {
        filteredPlaces.push(place);
      }
    });
  }

  // Calcular distancias si tenemos ubicación del usuario
  if (userLocation) {
    filteredPlaces = filteredPlaces.map(place => ({
      ...place,
      distance: `${calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng).toFixed(1)} km`
    }));

    // Ordenar por distancia
    filteredPlaces.sort((a, b) => {
      const distA = parseFloat(a.distance?.replace(' km', '') || '999');
      const distB = parseFloat(b.distance?.replace(' km', '') || '999');
      return distA - distB;
    });
  } else {
    // Ordenar por importancia si no hay ubicación del usuario
    filteredPlaces.sort((a, b) => (b.importance || 0) - (a.importance || 0));
  }

  return filteredPlaces.slice(0, 15); // Aumentado de 8 a 15
}

// Función para verificar si podemos acceder a la API
async function canAccessNominatim(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Reducido a 2 segundos
    
    const response = await fetch('https://nominatim.openstreetmap.org/search?q=test&format=json&limit=1', {
      method: 'GET',
      headers: {
        'User-Agent': 'PanteraTaximeter/1.0.0 (contact@panterataximeter.com)',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Geocodificación directa (buscar lugares por texto)
export async function geocodeSearch(
  query: string, 
  userLocation?: { lat: number; lng: number },
  limit: number = 15 // Aumentado de 10 a 15
): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  try {
    // Siempre intentar obtener datos mock primero para respuesta rápida
    const mockResults = searchMockPlaces(query, userLocation);
    
    // Check if we can access the Nominatim API
    const canAccess = await canAccessNominatim();
    
    if (!canAccess) {
      console.log('Nominatim API no disponible, usando datos locales');
      return mockResults;
    }

    // Wait for rate limiter before making request
    await rateLimiter.waitForNextRequest();

    // Construir URL de búsqueda con parámetros optimizados
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      extratags: '1',
      limit: limit.toString(),
      countrycodes: 'do,pr,us', // República Dominicana, Puerto Rico, Estados Unidos
      'accept-language': 'es,en',
    });

    // Si tenemos ubicación del usuario, agregar parámetros de proximidad
    if (userLocation) {
      params.append('lat', userLocation.lat.toString());
      params.append('lon', userLocation.lng.toString());
      params.append('bounded', '1');
      params.append('viewbox', `${userLocation.lng - 0.5},${userLocation.lat + 0.5},${userLocation.lng + 0.5},${userLocation.lat - 0.5}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // Reducido a 4 segundos

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'PanteraTaximeter/1.0.0 (contact@panterataximeter.com)',
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const apiResults = data.map((item: any, index: number) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      
      // Calcular distancia si tenemos ubicación del usuario
      let distance: string | undefined;
      if (userLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
        distance = `${dist.toFixed(1)} km`;
      }

      // Construir nombre y dirección
      const name = item.display_name.split(',')[0];
      const address = item.display_name;
      
      // Determinar tipo de lugar
      const type = getPlaceType(item.extratags || {}, item.category || '');

      return {
        id: `osm_${item.place_id || index}`,
        name: name,
        address: address,
        lat: lat,
        lng: lng,
        distance: distance,
        type: type,
        importance: parseFloat(item.importance || '0'),
      };
    });

    // Combinar resultados de API con mock data, evitando duplicados
    const combinedResults = [...apiResults];
    
    mockResults.forEach(mockPlace => {
      const isDuplicate = apiResults.some(apiPlace => 
        apiPlace.name.toLowerCase().includes(mockPlace.name.toLowerCase().substring(0, 10)) ||
        mockPlace.name.toLowerCase().includes(apiPlace.name.toLowerCase().substring(0, 10))
      );
      
      if (!isDuplicate) {
        combinedResults.push(mockPlace);
      }
    });

    return combinedResults
      .sort((a, b) => {
        // Ordenar por importancia y distancia
        if (userLocation && a.distance && b.distance) {
          const distA = parseFloat(a.distance.replace(' km', ''));
          const distB = parseFloat(b.distance.replace(' km', ''));
          return distA - distB;
        }
        return (b.importance || 0) - (a.importance || 0);
      })
      .slice(0, 15); // Limitar a 15 resultados finales

  } catch (error) {
    console.log('Error accediendo a Nominatim API, usando datos locales:', error);
    return searchMockPlaces(query, userLocation);
  }
}

// Geocodificación inversa (obtener dirección de coordenadas)
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    // Check if we can access the Nominatim API
    const canAccess = await canAccessNominatim();
    
    if (!canAccess) {
      // Return a generic address based on coordinates
      return {
        address: `Ubicación aproximada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        lat: lat,
        lng: lng,
      };
    }

    // Wait for rate limiter before making request
    await rateLimiter.waitForNextRequest();

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'es,en',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'PanteraTaximeter/1.0.0 (contact@panterataximeter.com)',
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      address: data.display_name || 'Ubicación desconocida',
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
    };

  } catch (error) {
    console.log('Error en geocodificación inversa, usando ubicación genérica:', error);
    return {
      address: `Ubicación aproximada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat: lat,
      lng: lng,
    };
  }
}

// Búsqueda de lugares populares cerca de una ubicación
export async function searchNearbyPlaces(
  userLocation: { lat: number; lng: number },
  radius: number = 15, // Aumentado de 10 a 15 km
  types: string[] = ['airport', 'hospital', 'university', 'shopping', 'tourism']
): Promise<GeocodeResult[]> {
  try {
    // Siempre devolver lugares mock cercanos primero
    const nearbyMockPlaces = mockPlaces
      .map(place => ({
        ...place,
        distance: `${calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng).toFixed(1)} km`
      }))
      .filter(place => {
        const dist = parseFloat(place.distance?.replace(' km', '') || '999');
        return dist <= radius;
      })
      .sort((a, b) => {
        const distA = parseFloat(a.distance?.replace(' km', '') || '999');
        const distB = parseFloat(b.distance?.replace(' km', '') || '999');
        return distA - distB;
      })
      .slice(0, 12); // Aumentado a 12

    // Check if we can access the Nominatim API
    const canAccess = await canAccessNominatim();
    
    if (!canAccess) {
      console.log('Nominatim API no disponible para lugares cercanos, usando datos locales');
      return nearbyMockPlaces;
    }

    const results: GeocodeResult[] = [];
    
    // Reduce the number of types to minimize API calls
    const limitedTypes = types.slice(0, 2); // Solo 2 tipos para reducir llamadas
    
    for (const type of limitedTypes) {
      try {
        // Wait for rate limiter before each request
        await rateLimiter.waitForNextRequest();

        const params = new URLSearchParams({
          q: type,
          format: 'json',
          addressdetails: '1',
          extratags: '1',
          limit: '5',
          lat: userLocation.lat.toString(),
          lon: userLocation.lng.toString(),
          bounded: '1',
          viewbox: `${userLocation.lng - 0.2},${userLocation.lat + 0.2},${userLocation.lng + 0.2},${userLocation.lat - 0.2}`,
          countrycodes: 'do,pr,us',
          'accept-language': 'es,en',
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 5000); // Increased timeout from 3000 to 5000 milliseconds

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
              headers: {
                'User-Agent': 'PanteraTaximeter/1.0.0 (contact@panterataximeter.com)',
              },
              signal: controller.signal
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            
            data.forEach((item: any, index: number) => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
              
              if (dist <= radius) {
                results.push({
                  id: `nearby_${type}_${item.place_id || index}`,
                  name: item.display_name.split(',')[0],
                  address: item.display_name,
                  lat: lat,
                  lng: lng,
                  distance: `${dist.toFixed(1)} km`,
                  type: getPlaceType(item.extratags || {}, item.category || ''),
                  importance: parseFloat(item.importance || '0'),
                });
              }
            });
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.log(`Error fetching ${type} places:`, fetchError);
          // Continue with next type instead of failing completely
        }
      } catch (typeError) {
        console.log(`Error searching for ${type}:`, typeError);
        // Continue with next type instead of failing completely
      }
    }

    // Combinar resultados de API con mock data
    const combinedResults = [...results];
    
    nearbyMockPlaces.forEach(mockPlace => {
      const isDuplicate = results.some(apiPlace => 
        apiPlace.name.toLowerCase().includes(mockPlace.name.toLowerCase().substring(0, 10)) ||
        mockPlace.name.toLowerCase().includes(apiPlace.name.toLowerCase().substring(0, 10))
      );
      
      if (!isDuplicate) {
        combinedResults.push(mockPlace);
      }
    });

    // Eliminar duplicados y ordenar por distancia
    const uniqueResults = combinedResults.filter((result, index, self) => 
      index === self.findIndex(r => r.name === result.name)
    );

    return uniqueResults
      .sort((a, b) => {
        const distA = parseFloat(a.distance?.replace(' km', '') || '999');
        const distB = parseFloat(b.distance?.replace(' km', '') || '999');
        return distA - distB;
      })
      .slice(0, 12); // Aumentado a 12

  } catch (error) {
    console.log('Error buscando lugares cercanos, usando datos locales:', error);
    return mockPlaces
      .map(place => ({
        ...place,
        distance: `${calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng).toFixed(1)} km`
      }))
      .filter(place => {
        const dist = parseFloat(place.distance?.replace(' km', '') || '999');
        return dist <= radius;
      })
      .sort((a, b) => {
        const distA = parseFloat(a.distance?.replace(' km', '') || '999');
        const distB = parseFloat(b.distance?.replace(' km', '') || '999');
        return distA - distB;
      })
      .slice(0, 12);
  }
}
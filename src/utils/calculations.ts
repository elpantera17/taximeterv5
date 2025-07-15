import { FareCategory } from '../types';

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateFare(
  distance: number,
  duration: number,
  fareCategory: FareCategory,
  dynamicMultiplier: number = 1.0
): number {
  const distanceInUnit = fareCategory.measurementUnit === 'mile' 
    ? distance * 0.621371 
    : distance;
  
  const durationInMinutes = duration / 60;
  
  const fare = 
    fareCategory.basicFare +
    (distanceInUnit * fareCategory.costPerKm) +
    (durationInMinutes * fareCategory.costPerMinute);
  
  const totalFare = Math.max(fare, fareCategory.minimumFare) * dynamicMultiplier;
  
  return Math.round(totalFare * Math.pow(10, fareCategory.decimalDigits)) / Math.pow(10, fareCategory.decimalDigits);
}

export function formatCurrency(
  amount: number,
  currencySymbol: string,
  decimalDigits: number
): string {
  return `${currencySymbol}${amount.toFixed(decimalDigits)}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatDistance(distance: number, unit: 'kilometer' | 'mile'): string {
  if (unit === 'mile') {
    const miles = distance * 0.621371;
    return `${miles.toFixed(2)} mi`;
  }
  return `${distance.toFixed(2)} km`;
}
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { FareCategory, Trip, AppSettings, AppStats } from '../types';

interface AppState {
  fareCategories: FareCategory[];
  trips: Trip[];
  settings: AppSettings;
  stats: AppStats;
  currentTrip: Trip | null;
  sidebarOpen: boolean;
}

type AppAction =
  | { type: 'SET_FARE_CATEGORIES'; payload: FareCategory[] }
  | { type: 'ADD_FARE_CATEGORY'; payload: FareCategory }
  | { type: 'UPDATE_FARE_CATEGORY'; payload: FareCategory }
  | { type: 'DELETE_FARE_CATEGORY'; payload: string }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_STATS'; payload: AppStats }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean };

const initialState: AppState = {
  fareCategories: [
    {
      id: '1',
      name: 'Estándar',
      currencySymbol: '$',
      decimalDigits: 2,
      basicFare: 25.00,
      minimumFare: 80.00,
      costPerMinute: 4.00,
      costPerKm: 8.00,
      measurementUnit: 'kilometer',
      isActive: true,
    },
    {
      id: '2',
      name: 'Premium',
      currencySymbol: '$',
      decimalDigits: 2,
      basicFare: 35.00,
      minimumFare: 120.00,
      costPerMinute: 6.00,
      costPerKm: 12.00,
      measurementUnit: 'kilometer',
      isActive: false,
    }
  ],
  trips: [],
  settings: {
    theme: 'light',
    defaultFareCategory: '1',
    dynamicMultiplier: 1.0,
    language: 'es',
  },
  stats: {
    totalTrips: 0,
    totalEarnings: 0,
    totalDistance: 0,
    totalTime: 0,
    averageTrip: 0,
  },
  currentTrip: null,
  sidebarOpen: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FARE_CATEGORIES':
      return { ...state, fareCategories: action.payload };
    case 'ADD_FARE_CATEGORY':
      return { ...state, fareCategories: [...state.fareCategories, action.payload] };
    case 'UPDATE_FARE_CATEGORY':
      return {
        ...state,
        fareCategories: state.fareCategories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };
    case 'DELETE_FARE_CATEGORY':
      return {
        ...state,
        fareCategories: state.fareCategories.filter(cat => cat.id !== action.payload),
      };
    case 'SET_TRIPS':
      return { ...state, trips: action.payload };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.id ? action.payload : trip
        ),
      };
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFares = localStorage.getItem('pantera-fares');
    const savedTrips = localStorage.getItem('pantera-trips');
    const savedSettings = localStorage.getItem('pantera-settings');

    if (savedFares) {
      dispatch({ type: 'SET_FARE_CATEGORIES', payload: JSON.parse(savedFares) });
    }
    if (savedTrips) {
      dispatch({ type: 'SET_TRIPS', payload: JSON.parse(savedTrips) });
    }
    if (savedSettings) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: JSON.parse(savedSettings) });
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('pantera-fares', JSON.stringify(state.fareCategories));
  }, [state.fareCategories]);

  useEffect(() => {
    localStorage.setItem('pantera-trips', JSON.stringify(state.trips));
  }, [state.trips]);

  useEffect(() => {
    localStorage.setItem('pantera-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Calculate stats when trips change
  useEffect(() => {
    const completedTrips = state.trips.filter(trip => trip.status === 'completed');
    const stats: AppStats = {
      totalTrips: completedTrips.length,
      totalEarnings: completedTrips.reduce((sum, trip) => sum + trip.totalCost, 0),
      totalDistance: completedTrips.reduce((sum, trip) => sum + trip.distance, 0),
      totalTime: completedTrips.reduce((sum, trip) => sum + trip.duration, 0),
      averageTrip: completedTrips.length > 0 
        ? completedTrips.reduce((sum, trip) => sum + trip.totalCost, 0) / completedTrips.length 
        : 0,
    };
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, [state.trips]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
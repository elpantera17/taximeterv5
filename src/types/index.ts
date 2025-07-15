export interface FareCategory {
  id: string;
  name: string;
  currencySymbol: string;
  decimalDigits: number;
  basicFare: number;
  minimumFare: number;
  costPerMinute: number;
  costPerKm: number;
  measurementUnit: 'kilometer' | 'mile';
  isActive: boolean;
  workGroupId?: string;
  createdBy?: string;
}

export interface Trip {
  id: string;
  startTime: Date;
  endTime?: Date;
  startLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  distance: number;
  duration: number;
  totalCost: number;
  fareCategory: FareCategory;
  dynamicMultiplier: number;
  status: 'pending' | 'active' | 'completed';
  route?: Array<{ lat: number; lng: number }>;
  userId?: string;
  workGroupId?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'normal' | 'vip' | 'vip2' | 'vip3' | 'vip4' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  profileImage?: string;
  vipExpiryDate?: Date;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  stats?: {
    totalTrips: number;
    totalEarnings: number;
    rating: number;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'night';
  defaultFareCategory: string;
  dynamicMultiplier: number;
  language: 'es' | 'en';
}

export interface AppStats {
  totalTrips: number;
  totalEarnings: number;
  totalDistance: number;
  totalTime: number;
  averageTrip: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
}

export interface WorkGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isActive: boolean;
  maxMembers: number;
  groupCode: string;
  settings?: {
    allowMemberInvites?: boolean;
    requireApproval?: boolean;
    showMemberStats?: boolean;
  };
  createdAt: Date;
}

export interface WorkGroupMember {
  id: string;
  workGroupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  nickname?: string;
  joinedAt: Date;
  isActive: boolean;
  permissions?: {
    canInvite?: boolean;
    canViewStats?: boolean;
    canEditFares?: boolean;
  };
}

export interface GroupInvitation {
  id: string;
  workGroupId: string;
  invitedBy: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}
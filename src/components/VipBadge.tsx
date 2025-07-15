import React from 'react';
import { Crown, Star, Shield } from 'lucide-react';

interface VipBadgeProps {
  role: 'normal' | 'vip' | 'vip2' | 'vip3' | 'vip4' | 'admin' | 'moderator';
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  className?: string;
}

export function VipBadge({ role, size = 'md', showFullName = false, className = '' }: VipBadgeProps) {
  const getVipConfig = () => {
    switch (role) {
      case 'admin':
        return {
          name: 'ADMINISTRADOR',
          shortName: 'ADMIN',
          icon: Crown,
          gradient: 'from-red-500 via-pink-500 to-purple-500',
          textColor: 'text-white',
          glow: 'shadow-red-500/50',
          animation: 'animate-pulse',
          stars: 0
        };
      case 'vip4':
        return {
          name: 'VIP DIAMANTE',
          shortName: 'VIP4',
          icon: Star,
          gradient: 'from-purple-500 via-pink-500 to-blue-500',
          textColor: 'text-white',
          glow: 'shadow-purple-500/50',
          animation: 'animate-bounce',
          stars: 4
        };
      case 'vip3':
        return {
          name: 'VIP PLATINO',
          shortName: 'VIP3',
          icon: Star,
          gradient: 'from-blue-500 via-cyan-500 to-teal-500',
          textColor: 'text-white',
          glow: 'shadow-blue-500/50',
          animation: 'animate-pulse',
          stars: 3
        };
      case 'vip2':
        return {
          name: 'VIP ORO',
          shortName: 'VIP2',
          icon: Star,
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          textColor: 'text-white',
          glow: 'shadow-yellow-500/50',
          animation: 'animate-pulse',
          stars: 2
        };
      case 'vip':
        return {
          name: 'VIP PLATA',
          shortName: 'VIP',
          icon: Star,
          gradient: 'from-gray-400 via-gray-300 to-blue-400',
          textColor: 'text-gray-900',
          glow: 'shadow-gray-400/50',
          animation: 'animate-pulse',
          stars: 1
        };
      case 'moderator':
        return {
          name: 'MODERADOR',
          shortName: 'MOD',
          icon: Shield,
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          textColor: 'text-white',
          glow: 'shadow-green-500/50',
          animation: '',
          stars: 0
        };
      default:
        return null;
    }
  };

  const config = getVipConfig();
  if (!config) return null;

  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const starSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`
      inline-flex items-center space-x-1 rounded-full font-bold
      bg-gradient-to-r ${config.gradient} ${config.textColor}
      shadow-lg ${config.glow} ${config.animation}
      ${sizeClasses[size]} ${className}
    `}>
      {/* Icono principal */}
      <Icon className={`${iconSizes[size]} ${role === 'admin' ? 'animate-spin-slow' : ''}`} />
      
      {/* Estrellas para VIP */}
      {config.stars > 0 && (
        <div className="flex space-x-0.5">
          {Array.from({ length: config.stars }).map((_, i) => (
            <Star 
              key={i} 
              className={`${starSizes[size]} fill-current animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
      
      {/* Nombre */}
      <span className="font-extrabold tracking-wide">
        {showFullName ? config.name : config.shortName}
      </span>
    </div>
  );
}

// Componente para efectos de gradiente animado
export function AnimatedVipBadge({ role, size = 'md', showFullName = false, className = '' }: VipBadgeProps) {
  const config = getVipConfig(role);
  if (!config) return <VipBadge role={role} size={size} showFullName={showFullName} className={className} />;

  return (
    <div className={`relative ${className}`}>
      {/* Fondo animado */}
      <div className={`
        absolute inset-0 rounded-full opacity-75 blur-sm
        bg-gradient-to-r ${config.gradient}
        animate-gradient-x
      `} />
      
      {/* Badge principal */}
      <VipBadge 
        role={role} 
        size={size} 
        showFullName={showFullName} 
        className="relative z-10" 
      />
    </div>
  );
}

function getVipConfig(role: string) {
  switch (role) {
    case 'admin':
      return {
        gradient: 'from-red-500 via-pink-500 to-purple-500'
      };
    case 'vip4':
      return {
        gradient: 'from-purple-500 via-pink-500 to-blue-500'
      };
    case 'vip3':
      return {
        gradient: 'from-blue-500 via-cyan-500 to-teal-500'
      };
    case 'vip2':
      return {
        gradient: 'from-yellow-400 via-orange-500 to-red-500'
      };
    case 'vip':
      return {
        gradient: 'from-gray-400 via-gray-300 to-blue-400'
      };
    case 'moderator':
      return {
        gradient: 'from-green-500 via-emerald-500 to-teal-500'
      };
    default:
      return null;
  }
}
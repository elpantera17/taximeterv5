import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  MapPin, 
  Tags, 
  Settings, 
  Share2, 
  X,
  Clock,
  Shield,
  User,
  LogOut,
  Bell,
  Users,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from './UserProfile';
import { NotificationCenter } from './NotificationCenter';
import { VipBadge } from './VipBadge';

const menuItems = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'statistics', label: 'Estadísticas', icon: BarChart3, path: '/statistics' },
  { id: 'trips', label: 'Viajes', icon: MapPin, path: '/trips' },
  { id: 'categories', label: 'Categorías de tarifas', icon: Tags, path: '/categories' },
  { id: 'workgroups', label: 'Grupos de Trabajo', icon: Users, path: '/workgroups', requiresVip: true },
  { id: 'groupfares', label: 'Tarifas del Grupo', icon: Briefcase, path: '/groupfares', requiresVip: true },
  { id: 'settings', label: 'Ajustes', icon: Settings, path: '/settings' },
  { id: 'admin', label: 'Panel de Admin', icon: Shield, path: '/admin' },
  { id: 'share', label: 'Compartir la app', icon: Share2, path: '/share' },
];

export function Sidebar() {
  const { state, dispatch } = useApp();
  const { state: authState, logout } = useAuth();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  const handleClose = () => {
    dispatch({ type: 'SET_SIDEBAR', payload: false });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Pantera Taximeter',
        text: 'Aplicación profesional de taxímetro',
        url: window.location.origin,
      });
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  const currentUser = authState.currentUser;

  const getRankDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Control total del sistema';
      case 'vip4':
        return 'Hasta 300 choferes en grupos';
      case 'vip3':
        return 'Hasta 100 choferes en grupos';
      case 'vip2':
        return 'Hasta 50 choferes en grupos';
      case 'vip':
        return 'Beneficios VIP individuales';
      case 'moderator':
        return 'Moderación de contenido';
      default:
        return 'Usuario estándar';
    }
  };

  const canAccessVipFeatures = (item: any) => {
    if (!item.requiresVip) return true;
    if (!currentUser) return false;
    return ['vip2', 'vip3', 'vip4', 'admin'].includes(currentUser.role);
  };

  return (
    <>
      {/* Overlay */}
      {state.sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[1500] md:hidden"
          onClick={handleClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-[2000] transform transition-transform duration-300
        ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-bounce"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <img 
                    src="/file_000000008d246230b67469ace47004d3 (1).png" 
                    alt="Pantera Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Pantera</h2>
                  <p className="text-blue-100 text-sm">Taximeter</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Notification Center */}
                <NotificationCenter />
                
                <button
                  onClick={handleClose}
                  className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* User Info with VIP Badge */}
            {currentUser && (
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {currentUser.firstName} {currentUser.lastName}
                    </div>
                    <div className="text-blue-100 text-xs truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                
                {/* VIP Badge y Rango */}
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <VipBadge 
                      role={currentUser.role} 
                      size="lg" 
                      showFullName={true}
                      className="transform hover:scale-105 transition-transform"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-blue-100 text-xs font-medium">
                      {getRankDescription(currentUser.role)}
                    </div>
                    
                    {/* Información VIP adicional */}
                    {currentUser.role.startsWith('vip') && currentUser.vipExpiryDate && (
                      <div className="mt-2 text-xs">
                        {new Date(currentUser.vipExpiryDate) > new Date() ? (
                          <div className="text-green-200">
                            ✅ VIP activo hasta {new Date(currentUser.vipExpiryDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-red-200">
                            ⚠️ VIP expirado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            // Hide admin panel for non-admin users
            if (item.id === 'admin' && currentUser?.role !== 'admin') {
              return null;
            }

            // Hide VIP features for non-VIP users
            if (item.requiresVip && !canAccessVipFeatures(item)) {
              return (
                <div key={item.id} className="relative">
                  <div className="flex items-center px-6 py-3 text-gray-400 dark:text-gray-600 opacity-50">
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                    <div className="ml-auto">
                      <VipBadge role="vip2" size="sm" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-50 pointer-events-none"></div>
                </div>
              );
            }
            
            if (item.id === 'share') {
              return (
                <button
                  key={item.id}
                  onClick={handleShare}
                  className="w-full flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleClose}
                className={`
                  flex items-center px-6 py-3 transition-colors font-medium relative
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-r-3 border-blue-600' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                  ${item.id === 'admin' ? 'border-t border-gray-200 dark:border-gray-700 mt-2 pt-4' : ''}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
                {item.id === 'admin' && (
                  <div className="ml-auto">
                    <VipBadge role="admin" size="sm" />
                  </div>
                )}
                {item.requiresVip && canAccessVipFeatures(item) && (
                  <div className="ml-auto">
                    <VipBadge role="vip2" size="sm" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        {currentUser && (
          <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <button
              onClick={() => setShowProfile(true)}
              className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 mr-3" />
              <span className="font-medium">Mi perfil</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Pantera Taximeter v1.0.1
          </p>
        </div>
      </div>

      {/* User Profile Modal */}
      {showProfile && currentUser && (
        <UserProfile
          user={currentUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
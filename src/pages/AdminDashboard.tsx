import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Shield, 
  Calendar,
  Mail,
  Phone,
  Car,
  Star,
  DollarSign,
  MapPin,
  Clock,
  Edit,
  Save,
  X,
  Eye,
  Settings,
  Database,
  AlertTriangle,
  CheckCircle,
  Megaphone,
  Cog,
  Lock,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { DatabaseStatus } from '../components/DatabaseStatus';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminRestrictions } from './AdminRestrictions';
import { AdminVipManagement } from './AdminVipManagement';
import { AdminSystemSettings } from './AdminSystemSettings';
import { VipBadge } from '../components/VipBadge';

type AdminTab = 'users' | 'vip' | 'announcements' | 'restrictions' | 'settings';

export function AdminDashboard() {
  const { state, dispatch } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [editingVipDate, setEditingVipDate] = useState(false);
  const [vipExpiryDate, setVipExpiryDate] = useState('');
  const [showVipModal, setShowVipModal] = useState(false);
  const [selectedVipPlan, setSelectedVipPlan] = useState('vip');
  const [vipDuration, setVipDuration] = useState('30');

  const handleToggleUserStatus = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      dispatch({
        type: 'UPDATE_USER',
        payload: { ...user, isActive: !user.isActive }
      });
    }
  };

  const handleToggleVipStatus = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      if (user.role.startsWith('vip')) {
        // Quitar VIP
        const updatedUser = { 
          ...user, 
          role: 'normal' as const,
          vipExpiryDate: undefined
        };
        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser
        });
      } else {
        // Hacer VIP - abrir modal para seleccionar plan y duración
        setSelectedUser(user);
        setShowVipModal(true);
      }
    }
  };

  const handleMakeVip = () => {
    if (!selectedUser) return;
    
    const days = parseInt(vipDuration);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    const updatedUser = {
      ...selectedUser,
      role: selectedVipPlan as 'vip' | 'vip2' | 'vip3' | 'vip4',
      vipExpiryDate: expiryDate
    };
    
    dispatch({
      type: 'UPDATE_USER',
      payload: updatedUser
    });
    
    setShowVipModal(false);
    setSelectedUser(null);
    setSelectedVipPlan('vip');
    setVipDuration('30');
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setVipExpiryDate(user.vipExpiryDate ? user.vipExpiryDate.toISOString().split('T')[0] : '');
    setShowUserProfile(true);
  };

  const handleSaveVipDate = () => {
    if (selectedUser && vipExpiryDate) {
      const updatedUser = {
        ...selectedUser,
        vipExpiryDate: new Date(vipExpiryDate)
      };
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });
      setSelectedUser(updatedUser);
      setEditingVipDate(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      dispatch({ type: 'DELETE_USER', payload: userId });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        Inactivo
      </span>
    );
  };

  const isVipExpired = (user: User) => {
    if (!user.role.startsWith('vip') || !user.vipExpiryDate) return false;
    return new Date() > new Date(user.vipExpiryDate);
  };

  const getVipExpiryStatus = (user: User) => {
    if (!user.role.startsWith('vip') || !user.vipExpiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(user.vipExpiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <span className="text-red-600 dark:text-red-400 text-xs font-medium">⚠️ Expirado hace {Math.abs(daysLeft)} días</span>;
    } else if (daysLeft <= 7) {
      return <span className="text-orange-600 dark:text-orange-400 text-xs font-medium">⏰ Expira en {daysLeft} días</span>;
    } else {
      return <span className="text-green-600 dark:text-green-400 text-xs">✅ Expira en {daysLeft} días</span>;
    }
  };

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'vip', label: 'Sistema VIP', icon: Crown },
    { id: 'announcements', label: 'Anuncios', icon: Megaphone },
    { id: 'restrictions', label: 'Restricciones', icon: Lock },
    { id: 'settings', label: 'Configuración', icon: Cog }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vip':
        return <AdminVipManagement />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'restrictions':
        return <AdminRestrictions />;
      case 'settings':
        return <AdminSystemSettings />;
      default:
        return renderUsersTab();
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Database Status */}
      <DatabaseStatus />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {state.users.filter(u => u.isActive).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios VIP</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {state.users.filter(u => u.role.startsWith('vip')).length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">VIP Expirados</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {state.users.filter(u => isVipExpired(u)).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Administradores</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {state.users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  VIP Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {state.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <VipBadge role={user.role} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.role.startsWith('vip') && user.vipExpiryDate && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Expira: {new Date(user.vipExpiryDate).toLocaleDateString('es-ES')}
                        </div>
                      )}
                      {getVipExpiryStatus(user)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {/* Ver Perfil */}
                      <button
                        onClick={() => handleViewProfile(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Ver perfil"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Toggle Estado */}
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
                        }`}
                        title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      {/* Toggle VIP */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleVipStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.role.startsWith('vip')
                              ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900'
                              : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          title={user.role.startsWith('vip') ? 'Quitar VIP' : 'Hacer VIP'}
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}

                      {/* Eliminar Usuario */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gestión completa del sistema
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total usuarios</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.users.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6">
        {renderTabContent()}
      </div>

      {/* VIP Plan Selection Modal */}
      {showVipModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Hacer VIP a {selectedUser.firstName} {selectedUser.lastName}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan VIP
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'vip', label: 'VIP PLATA', description: 'Plan Individual', color: 'from-gray-400 to-blue-400' },
                    { value: 'vip2', label: 'VIP ORO', description: 'Hasta 50 choferes', color: 'from-yellow-400 to-orange-500' },
                    { value: 'vip3', label: 'VIP PLATINO', description: 'Hasta 100 choferes', color: 'from-blue-500 to-cyan-500' },
                    { value: 'vip4', label: 'VIP DIAMANTE', description: 'Hasta 300 choferes', color: 'from-purple-500 to-pink-500' }
                  ].map((plan) => (
                    <label key={plan.value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="vipPlan"
                        value={plan.value}
                        checked={selectedVipPlan === plan.value}
                        onChange={(e) => setSelectedVipPlan(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className={`font-bold text-sm bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                          {plan.label}
                        </div>
                        <div className="text-xs text-gray-500">{plan.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración VIP (días)
                </label>
                <select
                  value={vipDuration}
                  onChange={(e) => setVipDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="7">7 días</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                  <option value="365">1 año</option>
                </select>
              </div>

              {/* Plan Benefits Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Beneficios incluidos:
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>✅ Mapas mejorados</li>
                  <li>✅ Estadísticas avanzadas</li>
                  <li>✅ Sin publicidad</li>
                  <li>✅ Viajes ilimitados</li>
                  <li>✅ Soporte prioritario</li>
                  <li>✅ Reportes avanzados</li>
                  <li>✅ Marca personalizada</li>
                  <li>✅ Acceso API</li>
                  <li>✅ Soporte dedicado</li>
                  {selectedVipPlan !== 'vip' && (
                    <li>✅ Grupos de trabajo ({
                      selectedVipPlan === 'vip2' ? '50' :
                      selectedVipPlan === 'vip3' ? '100' : '300'
                    } choferes)</li>
                  )}
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowVipModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMakeVip}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-bold shadow-lg"
                >
                  Hacer {selectedVipPlan.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
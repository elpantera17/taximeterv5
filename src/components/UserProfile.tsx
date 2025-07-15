import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Car, 
  Save, 
  X, 
  Edit, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Users,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { VipBadge } from './VipBadge';
import { updateUserProfile, changePassword } from '../services/supabase';

interface UserProfileProps {
  user: User;
  onClose: () => void;
  isAdmin?: boolean;
}

export function UserProfile({ user, onClose, isAdmin = false }: UserProfileProps) {
  const { dispatch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showWorkGroups, setShowWorkGroups] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    vehicleInfo: user.vehicleInfo || {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      color: ''
    }
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async () => {
    // Validaciones
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'El nombre y apellido son obligatorios' });
      return;
    }

    if (!formData.phone.trim()) {
      setMessage({ type: 'error', text: 'El teléfono es obligatorio' });
      return;
    }

    setIsLoading(true);
    try {
      const { user: updatedUser, error } = await updateUserProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        vehicleInfo: formData.vehicleInfo
      });

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
        return;
      }

      if (updatedUser) {
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'La contraseña actual es obligatoria' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' });
        return;
      }

      if (success) {
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      vehicleInfo: user.vehicleInfo || {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        color: ''
      }
    });
    setIsEditing(false);
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setMessage(null);
  };

  const canCreateWorkGroups = user.role && ['vip2', 'vip3', 'vip4', 'admin'].includes(user.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Editar Perfil' : 'Mi Perfil'}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <VipBadge role={user.role} size="sm" showFullName />
                  {user.vipExpiryDate && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.vipExpiryDate) > new Date() 
                        ? `Expira: ${new Date(user.vipExpiryDate).toLocaleDateString()}`
                        : 'VIP Expirado'
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`${
              message.type === 'success' 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Work Groups Section for VIP2+ */}
          {canCreateWorkGroups && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Grupos de Trabajo
                </h3>
                <button
                  onClick={() => setShowWorkGroups(!showWorkGroups)}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gestionar Grupos</span>
                </button>
              </div>
              
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <p className="mb-2">
                  <strong>Tu plan {user.role.toUpperCase()} te permite:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Crear grupos de trabajo con hasta {
                    user.role === 'vip2' ? '50' :
                    user.role === 'vip3' ? '100' :
                    user.role === 'vip4' ? '300' : 'ilimitados'
                  } choferes</li>
                  <li>Gestionar tarifas personalizadas para tu grupo</li>
                  <li>Invitar choferes usando códigos de grupo</li>
                  <li>Ver estadísticas consolidadas del equipo</li>
                </ul>
              </div>

              {showWorkGroups && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Accede a la sección "Grupos de Trabajo" desde el menú principal para:
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Crear y administrar tus grupos</li>
                    <li>• Generar códigos de invitación</li>
                    <li>• Aprobar nuevos miembros</li>
                    <li>• Configurar tarifas del grupo</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Información Personal
              </h3>
              {!isEditing && !showChangePassword && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apellido
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.lastName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    {user.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Información del Vehículo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marca
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vehicleInfo.make}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, make: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                    placeholder="Toyota, Honda, etc."
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.vehicleInfo?.make || 'No especificado'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vehicleInfo.model}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, model: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                    placeholder="Corolla, Civic, etc."
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.vehicleInfo?.model || 'No especificado'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.vehicleInfo.year}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, year: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.vehicleInfo?.year || 'No especificado'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Placa
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vehicleInfo.plate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, plate: e.target.value.toUpperCase() }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                    placeholder="ABC-123"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.vehicleInfo?.plate || 'No especificado'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vehicleInfo.color}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, color: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                    placeholder="Blanco, Negro, Azul, etc."
                  />
                ) : (
                  <div className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {user.vehicleInfo?.color || 'No especificado'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Seguridad
              </h3>
              {!isEditing && !showChangePassword && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cambiar contraseña</span>
                </button>
              )}
            </div>

            {showChangePassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Nueva contraseña (mín. 6 caracteres)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Confirmar nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-end space-x-3">
            {(isEditing || showChangePassword) && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Guardar cambios</span>
              </button>
            )}

            {showChangePassword && (
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Cambiar contraseña</span>
              </button>
            )}

            {!isEditing && !showChangePassword && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
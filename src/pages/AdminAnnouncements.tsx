import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Users, Target } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  targetAudience: 'all' | 'normal' | 'vip' | 'vip2' | 'vip3' | 'vip4' | 'admin';
  isActive: boolean;
  showOnTripComplete: boolean;
  showOnFareCreate: boolean;
  showOnLogin: boolean;
  priority: number;
  expiresAt?: Date;
  createdAt: Date;
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: '¡Viaje Completado!',
      message: '¡Excelente trabajo! Has completado otro viaje exitosamente. Sigue así para aumentar tus ganancias.',
      type: 'success',
      targetAudience: 'all',
      isActive: true,
      showOnTripComplete: true,
      showOnFareCreate: false,
      showOnLogin: false,
      priority: 1,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Nueva Tarifa Creada',
      message: 'Has creado una nueva categoría de tarifa. Recuerda activarla cuando esté lista para usar.',
      type: 'info',
      targetAudience: 'all',
      isActive: true,
      showOnTripComplete: false,
      showOnFareCreate: true,
      showOnLogin: false,
      priority: 1,
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Promoción VIP',
      message: '¡Hazte VIP y disfruta de mapas mejorados, estadísticas avanzadas y soporte prioritario!',
      type: 'promotion',
      targetAudience: 'normal',
      isActive: true,
      showOnTripComplete: true,
      showOnFareCreate: false,
      showOnLogin: true,
      priority: 2,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      createdAt: new Date()
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const handleToggleActive = (id: string) => {
    setAnnouncements(prev => 
      prev.map(ann => 
        ann.id === id ? { ...ann, isActive: !ann.isActive } : ann
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleSave = (announcementData: Partial<Announcement>) => {
    if (editingAnnouncement) {
      // Editar existente
      setAnnouncements(prev => 
        prev.map(ann => 
          ann.id === editingAnnouncement.id 
            ? { ...ann, ...announcementData }
            : ann
        )
      );
    } else {
      // Crear nuevo
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        createdAt: new Date(),
        ...announcementData
      } as Announcement;
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    }
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'promotion': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'Todos';
      case 'normal': return 'Usuarios Normales';
      case 'vip': return 'VIP';
      case 'vip2': return 'VIP2';
      case 'vip3': return 'VIP3';
      case 'vip4': return 'VIP4';
      case 'admin': return 'Administradores';
      default: return audience;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Anuncios
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los anuncios que ven los usuarios
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Anuncio</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-6 ${
              announcement.isActive 
                ? 'border-green-500' 
                : 'border-gray-300 dark:border-gray-600 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {announcement.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(announcement.type)}`}>
                    {announcement.type}
                  </span>
                  {announcement.priority > 1 && (
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400 rounded-full">
                      Prioridad Alta
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {announcement.message}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Audiencia: <span className="font-medium">{getAudienceLabel(announcement.targetAudience)}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {announcement.expiresAt 
                        ? `Expira: ${announcement.expiresAt.toLocaleDateString()}`
                        : 'Sin expiración'
                      }
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Mostrar en: {[
                        announcement.showOnLogin && 'Login',
                        announcement.showOnTripComplete && 'Viaje completado',
                        announcement.showOnFareCreate && 'Crear tarifa'
                      ].filter(Boolean).join(', ') || 'Ninguno'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggleActive(announcement.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    announcement.isActive
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
                      : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={announcement.isActive ? 'Desactivar' : 'Activar'}
                >
                  {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingAnnouncement(null);
          }}
        />
      )}
    </div>
  );
}

interface AnnouncementFormProps {
  announcement: Announcement | null;
  onSave: (data: Partial<Announcement>) => void;
  onClose: () => void;
}

function AnnouncementForm({ announcement, onSave, onClose }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    message: announcement?.message || '',
    type: announcement?.type || 'info',
    targetAudience: announcement?.targetAudience || 'all',
    isActive: announcement?.isActive ?? true,
    showOnTripComplete: announcement?.showOnTripComplete || false,
    showOnFareCreate: announcement?.showOnFareCreate || false,
    showOnLogin: announcement?.showOnLogin || false,
    priority: announcement?.priority || 1,
    expiresAt: announcement?.expiresAt ? announcement.expiresAt.toISOString().split('T')[0] : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {announcement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="info">Información</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
                <option value="promotion">Promoción</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audiencia
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="normal">Usuarios Normales</option>
                <option value="vip">VIP</option>
                <option value="vip2">VIP2</option>
                <option value="vip3">VIP3</option>
                <option value="vip4">VIP4</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>Normal</option>
                <option value={2}>Alta</option>
                <option value={3}>Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de expiración (opcional)
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Mostrar en:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showOnLogin}
                    onChange={(e) => setFormData({ ...formData, showOnLogin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Al iniciar sesión</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showOnTripComplete}
                    onChange={(e) => setFormData({ ...formData, showOnTripComplete: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Al completar viaje</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showOnFareCreate}
                    onChange={(e) => setFormData({ ...formData, showOnFareCreate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Al crear/editar tarifa</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Anuncio activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {announcement ? 'Actualizar' : 'Crear'} Anuncio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
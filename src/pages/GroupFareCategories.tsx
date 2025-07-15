import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Lock, Shield, Users } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/calculations';
import { VipBadge } from '../components/VipBadge';

interface GroupFareCategory {
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
  workGroupId: string;
  createdBy: string;
  createdAt: Date;
}

interface WorkGroupMember {
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
}

export function GroupFareCategories() {
  const { state: authState } = useAuth();
  const currentUser = authState.currentUser;
  
  const [fareCategories, setFareCategories] = useState<GroupFareCategory[]>([
    {
      id: '1',
      name: 'Tarifa Grupo Express',
      currencySymbol: '$',
      decimalDigits: 2,
      basicFare: 30.00,
      minimumFare: 90.00,
      costPerMinute: 5.00,
      costPerKm: 10.00,
      measurementUnit: 'kilometer',
      isActive: true,
      workGroupId: '1',
      createdBy: '1', // ID del dueño del grupo
      createdAt: new Date()
    }
  ]);

  // Simular miembros del grupo para determinar permisos
  const [groupMembers, setGroupMembers] = useState<WorkGroupMember[]>([
    { userId: '1', role: 'owner' }, // Dueño del grupo
    { userId: currentUser?.id || '', role: 'moderator' }, // El usuario actual es moderador
    { userId: '3', role: 'member' } // Otro miembro normal
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GroupFareCategory | null>(null);

  const canManageFares = currentUser && ['vip2', 'vip3', 'vip4', 'admin'].includes(currentUser.role);
  
  // Determinar el rol del usuario actual en el grupo
  const userRole = groupMembers.find(m => m.userId === currentUser?.id)?.role || 'member';
  
  // Determinar si el usuario puede crear tarifas (solo dueño)
  const canCreateFares = userRole === 'owner' || currentUser?.role === 'admin';
  
  // Determinar si el usuario puede editar tarifas (dueño o moderador)
  const canEditFares = userRole === 'owner' || userRole === 'moderator' || currentUser?.role === 'admin';

  const handleAddCategory = () => {
    if (!canCreateFares) {
      alert('Solo el dueño del grupo puede crear nuevas tarifas');
      return;
    }
    
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: GroupFareCategory) => {
    // Verificar si el usuario puede editar esta tarifa
    if (!canEditCategory(category)) {
      alert('No tienes permisos para editar esta tarifa');
      return;
    }
    
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = fareCategories.find(c => c.id === categoryId);
    if (!category) return;

    // Solo el creador o admin puede eliminar
    if (!canDeleteCategory(category)) {
      alert('Solo el dueño del grupo puede eliminar esta tarifa');
      return;
    }

    if (fareCategories.length === 1) {
      alert('No puedes eliminar la única categoría de tarifa del grupo');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setFareCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const handleSetActive = (categoryId: string) => {
    const category = fareCategories.find(c => c.id === categoryId);
    if (!category) return;

    // Solo el dueño, moderador o admin puede activar
    if (!canEditFares) {
      alert('No tienes permisos para activar esta tarifa');
      return;
    }

    // Desactivar todas las categorías primero
    setFareCategories(prev => prev.map(c => ({ ...c, isActive: false })));
    
    // Activar la seleccionada
    setFareCategories(prev => prev.map(c => 
      c.id === categoryId ? { ...c, isActive: true } : c
    ));
  };

  const handleSaveCategory = (categoryData: Partial<GroupFareCategory>) => {
    if (editingCategory) {
      // Verificar permisos para editar
      if (!canEditCategory(editingCategory)) {
        alert('No tienes permisos para editar esta tarifa');
        return;
      }
      
      setFareCategories(prev => prev.map(c => 
        c.id === editingCategory.id ? { ...c, ...categoryData } : c
      ));
    } else {
      // Verificar permisos para crear
      if (!canCreateFares) {
        alert('Solo el dueño del grupo puede crear nuevas tarifas');
        return;
      }
      
      const newCategory: GroupFareCategory = {
        id: Date.now().toString(),
        workGroupId: '1', // En producción esto vendría del grupo seleccionado
        createdBy: currentUser?.id || '',
        createdAt: new Date(),
        ...categoryData
      } as GroupFareCategory;
      
      setFareCategories(prev => [...prev, newCategory]);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  const canEditCategory = (category: GroupFareCategory) => {
    // Administradores pueden editar cualquier tarifa
    if (currentUser?.role === 'admin') return true;
    
    // Dueños pueden editar cualquier tarifa de su grupo
    if (userRole === 'owner') return true;
    
    // Moderadores pueden editar tarifas pero no las creadas por ellos mismos
    if (userRole === 'moderator') return true;
    
    // Miembros normales no pueden editar tarifas
    return false;
  };

  const canDeleteCategory = (category: GroupFareCategory) => {
    // Solo el dueño o admin puede eliminar tarifas
    return userRole === 'owner' || currentUser?.role === 'admin';
  };

  const isOwnerCategory = (category: GroupFareCategory) => {
    // Verificar si la tarifa fue creada por el dueño del grupo
    return category.createdBy === '1'; // ID del dueño del grupo
  };

  if (!canManageFares) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Tarifas del Grupo" />
        
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acceso Restringido
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Solo los propietarios de grupos de trabajo (VIP2+) pueden gestionar tarifas personalizadas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Tarifas del Grupo" />
      
      <div className="p-4 space-y-4">
        {/* Header info */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Tarifas Personalizadas del Grupo</h2>
          <p className="text-purple-100">
            {userRole === 'owner' ? (
              "Crea tarifas específicas para tu grupo de trabajo. Tú y los moderadores pueden editarlas."
            ) : userRole === 'moderator' ? (
              "Como moderador, puedes editar las tarifas del grupo pero no crear nuevas ni eliminarlas."
            ) : (
              "Estas son las tarifas disponibles para tu grupo de trabajo."
            )}
          </p>
          
          {/* Mostrar rol en el grupo */}
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-purple-100">Tu rol en el grupo:</span>
            {userRole === 'owner' ? (
              <VipBadge role="vip2" size="sm" />
            ) : userRole === 'moderator' ? (
              <VipBadge role="moderator" size="sm" />
            ) : (
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                Miembro
              </span>
            )}
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {fareCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 ${
                category.isActive 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : isOwnerCategory(category)
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  {category.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                      Activa
                    </span>
                  )}
                  {isOwnerCategory(category) && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
                      <Crown className="w-3 h-3" />
                      <span>Tarifa del Dueño</span>
                    </div>
                  )}
                  {!canEditCategory(category) && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full text-xs">
                      <Lock className="w-3 h-3" />
                      <span>Solo lectura</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!category.isActive && canEditFares && (
                    <button
                      onClick={() => handleSetActive(category.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                      title="Activar tarifa"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {canEditCategory(category) && (
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDeleteCategory(category) && (
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tarifa básica</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.basicFare, category.currencySymbol, category.decimalDigits)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tarifa mínima</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.minimumFare, category.currencySymbol, category.decimalDigits)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Costo por minuto</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.costPerMinute, category.currencySymbol, category.decimalDigits)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Costo por {category.measurementUnit === 'kilometer' ? 'km' : 'mi'}
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.costPerKm, category.currencySymbol, category.decimalDigits)}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Creada el {category.createdAt.toLocaleDateString()} 
                {category.createdBy === currentUser?.id ? ' por ti' : 
                 isOwnerCategory(category) ? ' por el dueño del grupo' : ' por otro miembro'}
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Button - Solo visible para el dueño */}
        {canCreateFares && (
          <button
            onClick={handleAddCategory}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>AÑADIR TARIFA DEL GRUPO</span>
          </button>
        )}
        
        {/* Información sobre permisos para moderadores */}
        {userRole === 'moderator' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-300">
                <p className="font-medium mb-1">Permisos de moderador:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Puedes editar las tarifas existentes del grupo</li>
                  <li>Puedes activar/desactivar tarifas</li>
                  <li>No puedes crear nuevas tarifas ni eliminar las existentes</li>
                  <li>Solo el dueño del grupo puede crear y eliminar tarifas</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <GroupFareCategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
          isModeratorEditing={userRole === 'moderator'}
        />
      )}
    </div>
  );
}

interface GroupFareCategoryFormProps {
  category: GroupFareCategory | null;
  onClose: () => void;
  onSave: (category: Partial<GroupFareCategory>) => void;
  isModeratorEditing?: boolean;
}

function GroupFareCategoryForm({ category, onClose, onSave, isModeratorEditing = false }: GroupFareCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    currencySymbol: category?.currencySymbol || '$',
    decimalDigits: category?.decimalDigits || 2,
    basicFare: category?.basicFare || 0,
    minimumFare: category?.minimumFare || 0,
    costPerMinute: category?.costPerMinute || 0,
    costPerKm: category?.costPerKm || 0,
    measurementUnit: category?.measurementUnit || 'kilometer',
    isActive: category?.isActive || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onSave(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category ? (
                isModeratorEditing ? 'Editar tarifa como moderador' : 'Editar tarifa del grupo'
              ) : (
                'Nueva tarifa del grupo'
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de tarifa
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="ej. Tarifa Grupo Express"
              maxLength={30}
              required
              disabled={isModeratorEditing && category?.createdBy === '1'} // Moderadores no pueden cambiar el nombre de tarifas del dueño
            />
            {isModeratorEditing && category?.createdBy === '1' && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Como moderador, no puedes cambiar el nombre de las tarifas creadas por el dueño
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Símbolo de moneda
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => updateField('currencySymbol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="$"
                maxLength={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dígitos decimales
              </label>
              <select
                value={formData.decimalDigits}
                onChange={(e) => updateField('decimalDigits', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarifa básica
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.basicFare}
              onChange={(e) => updateField('basicFare', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarifa mínima
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minimumFare}
              onChange={(e) => updateField('minimumFare', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Costo por minuto
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costPerMinute}
              onChange={(e) => updateField('costPerMinute', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidad de medida
            </label>
            <select
              value={formData.measurementUnit}
              onChange={(e) => updateField('measurementUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="kilometer">Kilómetro</option>
              <option value="mile">Milla</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Costo por {formData.measurementUnit === 'kilometer' ? 'km' : 'milla'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costPerKm}
              onChange={(e) => updateField('costPerKm', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Activar esta tarifa por defecto
            </label>
          </div>

          {isModeratorEditing && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Estás editando esta tarifa como moderador
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
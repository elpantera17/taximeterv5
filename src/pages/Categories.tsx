import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { FareCategory } from '../types';

export function Categories() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FareCategory | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: FareCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (state.fareCategories.length === 1) {
      alert('No puedes eliminar la única categoría de tarifa');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      dispatch({ type: 'DELETE_FARE_CATEGORY', payload: categoryId });
    }
  };

  const handleSetActive = (categoryId: string) => {
    // Deactivate all categories first
    state.fareCategories.forEach(category => {
      if (category.isActive) {
        dispatch({
          type: 'UPDATE_FARE_CATEGORY',
          payload: { ...category, isActive: false }
        });
      }
    });
    
    // Activate selected category
    const category = state.fareCategories.find(c => c.id === categoryId);
    if (category) {
      dispatch({
        type: 'UPDATE_FARE_CATEGORY',
        payload: { ...category, isActive: true }
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Categorías de tarifas" />
      
      <div className="p-4 space-y-4">
        {/* Categories List */}
        <div className="space-y-3">
          {state.fareCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 ${
                category.isActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  {category.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      Activa
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!category.isActive && (
                    <button
                      onClick={() => handleSetActive(category.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                      title="Activar tarifa"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
            </div>
          ))}
        </div>

        {/* Add Category Button */}
        <button
          onClick={handleAddCategory}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>AÑADIR CATEGORÍA</span>
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
          onSave={(category) => {
            if (editingCategory) {
              dispatch({ type: 'UPDATE_FARE_CATEGORY', payload: category });
            } else {
              dispatch({ type: 'ADD_FARE_CATEGORY', payload: category });
            }
            handleCloseForm();
          }}
        />
      )}
    </div>
  );
}

interface CategoryFormProps {
  category: FareCategory | null;
  onClose: () => void;
  onSave: (category: FareCategory) => void;
}

function CategoryForm({ category, onClose, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<FareCategory>>({
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

    const newCategory: FareCategory = {
      id: category?.id || Date.now().toString(),
      name: formData.name!,
      currencySymbol: formData.currencySymbol!,
      decimalDigits: formData.decimalDigits!,
      basicFare: formData.basicFare!,
      minimumFare: formData.minimumFare!,
      costPerMinute: formData.costPerMinute!,
      costPerKm: formData.costPerKm!,
      measurementUnit: formData.measurementUnit!,
      isActive: formData.isActive!,
    };

    onSave(newCategory);
  };

  const updateField = (field: keyof FareCategory, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category ? 'Editar categoría' : 'Nueva categoría'}
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
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="ej. Estándar, Premium"
              maxLength={30}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Símbolo de moneda
              </label>
              <input
                type="text"
                value={formData.currencySymbol || ''}
                onChange={(e) => updateField('currencySymbol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                value={formData.decimalDigits || 2}
                onChange={(e) => updateField('decimalDigits', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
              value={formData.basicFare || ''}
              onChange={(e) => updateField('basicFare', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Una tarifa plana cobrada al inicio del viaje
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarifa mínima
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minimumFare || ''}
              onChange={(e) => updateField('minimumFare', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Valor mínimo cobrado en un viaje
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Costo por minuto
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costPerMinute || ''}
              onChange={(e) => updateField('costPerMinute', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cuánto se cobra por cada minuto del viaje
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidad de medida
            </label>
            <select
              value={formData.measurementUnit || 'kilometer'}
              onChange={(e) => updateField('measurementUnit', e.target.value as 'kilometer' | 'mile')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
              value={formData.costPerKm || ''}
              onChange={(e) => updateField('costPerKm', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Activar esta tarifa por defecto
            </label>
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
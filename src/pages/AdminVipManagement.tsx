import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  DollarSign, 
  Users, 
  Gift,
  Star,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface VipPlan {
  id: string;
  name: string;
  level: number;
  max_drivers: number;
  is_active: boolean;
}

interface VipPricing {
  id: string;
  plan_id: string;
  billing_period: 'monthly' | 'yearly';
  price: number;
  discount_percentage: number;
  is_active: boolean;
}

interface VipOffer {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  discount_percentage: number;
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
}

interface VipBenefit {
  id: string;
  plan_id: string;
  benefit_key: string;
  benefit_title: string;
  benefit_description: string;
  is_active: boolean;
  sort_order: number;
}

type VipTab = 'plans' | 'pricing' | 'offers' | 'benefits';

export function AdminVipManagement() {
  const [activeTab, setActiveTab] = useState<VipTab>('plans');
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [pricing, setPricing] = useState<VipPricing[]>([]);
  const [offers, setOffers] = useState<VipOffer[]>([]);
  const [benefits, setBenefits] = useState<VipBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para modales
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VipPlan | null>(null);
  const [editingOffer, setEditingOffer] = useState<VipOffer | null>(null);

  useEffect(() => {
    loadVipData();
  }, []);

  const loadVipData = async () => {
    setLoading(true);
    try {
      // En producción, esto vendría de Supabase
      const mockPlans: VipPlan[] = [
        { id: 'vip1', name: 'VIP', level: 1, max_drivers: 0, is_active: true },
        { id: 'vip2', name: 'VIP2', level: 2, max_drivers: 50, is_active: true },
        { id: 'vip3', name: 'VIP3', level: 3, max_drivers: 100, is_active: true },
        { id: 'vip4', name: 'VIP4', level: 4, max_drivers: 300, is_active: true }
      ];

      const mockPricing: VipPricing[] = [
        // Precios mensuales
        { id: '1', plan_id: 'vip1', billing_period: 'monthly', price: 3.00, discount_percentage: 0, is_active: true },
        { id: '2', plan_id: 'vip2', billing_period: 'monthly', price: 25.00, discount_percentage: 0, is_active: true },
        { id: '3', plan_id: 'vip3', billing_period: 'monthly', price: 40.00, discount_percentage: 0, is_active: true },
        { id: '4', plan_id: 'vip4', billing_period: 'monthly', price: 70.00, discount_percentage: 0, is_active: true },
        // Precios anuales
        { id: '5', plan_id: 'vip1', billing_period: 'yearly', price: 14.40, discount_percentage: 60, is_active: true },
        { id: '6', plan_id: 'vip2', billing_period: 'yearly', price: 120.00, discount_percentage: 60, is_active: true },
        { id: '7', plan_id: 'vip3', billing_period: 'yearly', price: 192.00, discount_percentage: 60, is_active: true },
        { id: '8', plan_id: 'vip4', billing_period: 'yearly', price: 336.00, discount_percentage: 60, is_active: true }
      ];

      const mockOffers: VipOffer[] = [
        {
          id: '1',
          plan_id: 'vip1',
          title: 'Oferta de Lanzamiento VIP',
          description: '50% de descuento en tu primer mes VIP',
          discount_percentage: 50,
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active: true
        },
        {
          id: '2',
          plan_id: 'vip2',
          title: 'Promoción VIP2 Empresarial',
          description: 'Descuento especial para equipos de trabajo',
          discount_percentage: 30,
          start_date: new Date(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          is_active: true
        }
      ];

      // Beneficios unificados para todos los VIP
      const baseBenefits = [
        { key: 'enhanced_maps', title: 'Mapas Mejorados', description: 'Acceso a mapas de alta calidad con mejor precisión' },
        { key: 'advanced_stats', title: 'Estadísticas Avanzadas', description: 'Reportes detallados de ganancias y rendimiento' },
        { key: 'priority_support', title: 'Soporte Prioritario', description: 'Atención al cliente con prioridad VIP' },
        { key: 'no_ads', title: 'Sin Publicidad', description: 'Experiencia libre de anuncios publicitarios' },
        { key: 'unlimited_trips', title: 'Viajes Ilimitados', description: 'Sin límite en la cantidad de viajes diarios' },
        { key: 'work_groups', title: 'Grupos de Trabajo', description: 'Crear y gestionar grupos de trabajo con choferes' },
        { key: 'team_management', title: 'Gestión de Equipo', description: 'Administrar choferes y asignar permisos' },
        { key: 'group_analytics', title: 'Analíticas de Grupo', description: 'Estadísticas consolidadas del equipo de trabajo' },
        { key: 'advanced_reporting', title: 'Reportes Avanzados', description: 'Exportar reportes en PDF y Excel' },
        { key: 'custom_branding', title: 'Marca Personalizada', description: 'Personalizar la app con tu logo y colores' },
        { key: 'api_access', title: 'Acceso API', description: 'Integración con sistemas externos via API' },
        { key: 'dedicated_support', title: 'Soporte Dedicado', description: 'Gerente de cuenta personal y soporte 24/7' }
      ];

      const mockBenefits: VipBenefit[] = [];
      mockPlans.forEach(plan => {
        baseBenefits.forEach((benefit, index) => {
          mockBenefits.push({
            id: `${plan.id}_${benefit.key}`,
            plan_id: plan.id,
            benefit_key: benefit.key,
            benefit_title: benefit.title,
            benefit_description: benefit.description,
            is_active: true,
            sort_order: index + 1
          });
        });
      });

      setPlans(mockPlans);
      setPricing(mockPricing);
      setOffers(mockOffers);
      setBenefits(mockBenefits);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar datos VIP' });
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = async (pricingId: string, newPrice: number) => {
    setSaving(true);
    try {
      setPricing(prev => 
        prev.map(p => p.id === pricingId ? { ...p, price: newPrice } : p)
      );
      setMessage({ type: 'success', text: 'Precio actualizado correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar precio' });
    } finally {
      setSaving(false);
    }
  };

  const toggleOfferStatus = async (offerId: string) => {
    try {
      setOffers(prev => 
        prev.map(offer => 
          offer.id === offerId ? { ...offer, is_active: !offer.is_active } : offer
        )
      );
      setMessage({ type: 'success', text: 'Estado de oferta actualizado' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar oferta' });
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      try {
        setOffers(prev => prev.filter(offer => offer.id !== offerId));
        setMessage({ type: 'success', text: 'Oferta eliminada correctamente' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al eliminar oferta' });
      }
    }
  };

  const saveOffer = (offerData: Partial<VipOffer>) => {
    if (editingOffer) {
      setOffers(prev => 
        prev.map(offer => 
          offer.id === editingOffer.id ? { ...offer, ...offerData } : offer
        )
      );
    } else {
      const newOffer: VipOffer = {
        id: Date.now().toString(),
        ...offerData
      } as VipOffer;
      setOffers(prev => [newOffer, ...prev]);
    }
    setShowOfferForm(false);
    setEditingOffer(null);
    setMessage({ type: 'success', text: 'Oferta guardada correctamente' });
    setTimeout(() => setMessage(null), 3000);
  };

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Plan desconocido';
  };

  const getMaxDrivers = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.max_drivers || 0;
  };

  const tabs = [
    { id: 'plans', label: 'Planes VIP', icon: Crown },
    { id: 'pricing', label: 'Precios', icon: DollarSign },
    { id: 'offers', label: 'Ofertas', icon: Gift },
    { id: 'benefits', label: 'Beneficios', icon: Star }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando sistema VIP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema VIP
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona planes, precios, ofertas y beneficios VIP
          </p>
        </div>
        <button
          onClick={loadVipData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm ${
            message.type === 'success' 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as VipTab)}
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'plans' && (
          <PlansTab plans={plans} />
        )}

        {activeTab === 'pricing' && (
          <PricingTab 
            pricing={pricing} 
            plans={plans}
            onUpdatePrice={updatePricing}
            saving={saving}
          />
        )}

        {activeTab === 'offers' && (
          <OffersTab 
            offers={offers}
            plans={plans}
            onToggleStatus={toggleOfferStatus}
            onDelete={deleteOffer}
            onEdit={(offer) => {
              setEditingOffer(offer);
              setShowOfferForm(true);
            }}
            onAdd={() => {
              setEditingOffer(null);
              setShowOfferForm(true);
            }}
          />
        )}

        {activeTab === 'benefits' && (
          <BenefitsTab benefits={benefits} plans={plans} />
        )}
      </div>

      {/* Offer Form Modal */}
      {showOfferForm && (
        <OfferFormModal
          offer={editingOffer}
          plans={plans}
          onSave={saveOffer}
          onClose={() => {
            setShowOfferForm(false);
            setEditingOffer(null);
          }}
        />
      )}
    </div>
  );
}

// Componente para la pestaña de planes
function PlansTab({ plans }: { plans: VipPlan[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              plan.is_active 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {plan.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Nivel:</span>
              <span className="font-medium text-gray-900 dark:text-white">{plan.level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Máx. choferes:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {plan.max_drivers === 0 ? 'N/A' : plan.max_drivers}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {plan.level === 1 && 'Plan individual con beneficios básicos VIP'}
              {plan.level === 2 && 'Plan para equipos pequeños hasta 50 choferes'}
              {plan.level === 3 && 'Plan para equipos medianos hasta 100 choferes'}
              {plan.level === 4 && 'Plan empresarial hasta 300 choferes'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para la pestaña de precios
function PricingTab({ pricing, plans, onUpdatePrice, saving }: {
  pricing: VipPricing[];
  plans: VipPlan[];
  onUpdatePrice: (id: string, price: number) => void;
  saving: boolean;
}) {
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const handleEditPrice = (pricingItem: VipPricing) => {
    setEditingPrice(pricingItem.id);
    setTempPrice(pricingItem.price);
  };

  const handleSavePrice = (pricingId: string) => {
    onUpdatePrice(pricingId, tempPrice);
    setEditingPrice(null);
  };

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Plan desconocido';
  };

  const groupedPricing = pricing.reduce((acc, item) => {
    if (!acc[item.plan_id]) {
      acc[item.plan_id] = [];
    }
    acc[item.plan_id].push(item);
    return acc;
  }, {} as Record<string, VipPricing[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedPricing).map(([planId, planPricing]) => (
        <div key={planId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              {getPlanName(planId)}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planPricing.map((item) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {item.billing_period === 'monthly' ? 'Mensual' : 'Anual'}
                    </h4>
                    {item.discount_percentage > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                        -{item.discount_percentage}%
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {editingPrice === item.id ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleSavePrice(item.id)}
                            disabled={saving}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPrice(null)}
                            className="p-1 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleEditPrice(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {item.billing_period === 'yearly' && item.discount_percentage > 0 && (
                      <span>Precio original: ${(item.price / (1 - item.discount_percentage / 100)).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para la pestaña de ofertas
function OffersTab({ offers, plans, onToggleStatus, onDelete, onEdit, onAdd }: {
  offers: VipOffer[];
  plans: VipPlan[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (offer: VipOffer) => void;
  onAdd: () => void;
}) {
  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Plan desconocido';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Oferta</span>
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay ofertas
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Crea tu primera oferta especial para los planes VIP
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {offer.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                      {getPlanName(offer.plan_id)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
                      -{offer.discount_percentage}%
                    </span>
                    {offer.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                        Activa
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {offer.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Inicio: {offer.start_date.toLocaleDateString()}</span>
                    </div>
                    {offer.end_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Fin: {offer.end_date.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onToggleStatus(offer.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      offer.is_active
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={offer.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {offer.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => onEdit(offer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => onDelete(offer.id)}
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
      )}
    </div>
  );
}

// Componente para la pestaña de beneficios
function BenefitsTab({ benefits, plans }: {
  benefits: VipBenefit[];
  plans: VipPlan[];
}) {
  // Agrupar beneficios por plan
  const groupedBenefits = benefits.reduce((acc, benefit) => {
    if (!acc[benefit.plan_id]) {
      acc[benefit.plan_id] = [];
    }
    acc[benefit.plan_id].push(benefit);
    return acc;
  }, {} as Record<string, VipBenefit[]>);

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Plan desconocido';
  };

  const getMaxDrivers = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.max_drivers || 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Beneficios VIP Unificados</p>
            <p>Todos los planes VIP tienen los mismos beneficios. La única diferencia es la cantidad máxima de choferes que pueden agregar a sus grupos de trabajo.</p>
          </div>
        </div>
      </div>

      {Object.entries(groupedBenefits).map(([planId, planBenefits]) => (
        <div key={planId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                {getPlanName(planId)}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {getMaxDrivers(planId) === 0 ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    Plan Individual
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    Hasta {getMaxDrivers(planId)} choferes
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planBenefits
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((benefit) => (
                  <div key={benefit.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {benefit.benefit_title}
                        {benefit.benefit_key === 'work_groups' && getMaxDrivers(planId) > 0 && (
                          <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                            (hasta {getMaxDrivers(planId)} choferes)
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {benefit.benefit_description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Modal para crear/editar ofertas
function OfferFormModal({ offer, plans, onSave, onClose }: {
  offer: VipOffer | null;
  plans: VipPlan[];
  onSave: (data: Partial<VipOffer>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    plan_id: offer?.plan_id || plans[0]?.id || '',
    title: offer?.title || '',
    description: offer?.description || '',
    discount_percentage: offer?.discount_percentage || 10,
    start_date: offer?.start_date ? offer.start_date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: offer?.end_date ? offer.end_date.toISOString().split('T')[0] : '',
    is_active: offer?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      start_date: new Date(formData.start_date),
      end_date: formData.end_date ? new Date(formData.end_date) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {offer ? 'Editar Oferta' : 'Nueva Oferta'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan VIP
            </label>
            <select
              value={formData.plan_id}
              onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descuento (%)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de fin (opcional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Oferta activa</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {offer ? 'Actualizar' : 'Crear'} Oferta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
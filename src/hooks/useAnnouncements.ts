import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  isRead: boolean;
  createdAt: Date;
  announcementId?: string;
}

export function useAnnouncements() {
  const { state: authState } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Simular carga de anuncios desde Supabase
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        
        // En producción, esto vendría de Supabase
        const mockAnnouncements: Announcement[] = [
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
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date()
          }
        ];

        // Filtrar anuncios según el rol del usuario
        const userRole = authState.currentUser?.role || 'normal';
        const filteredAnnouncements = mockAnnouncements.filter(ann => 
          ann.isActive && 
          (ann.targetAudience === 'all' || ann.targetAudience === userRole) &&
          (!ann.expiresAt || ann.expiresAt > new Date())
        );

        setAnnouncements(filteredAnnouncements);
      } catch (error) {
        console.error('Error loading announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authState.currentUser) {
      loadAnnouncements();
    }
  }, [authState.currentUser]);

  // Crear notificación cuando se completa un viaje
  const triggerTripCompleteNotifications = () => {
    const tripCompleteAnnouncements = announcements.filter(ann => ann.showOnTripComplete);
    
    tripCompleteAnnouncements.forEach(ann => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${ann.id}`,
        title: ann.title,
        message: ann.message,
        type: ann.type,
        isRead: false,
        createdAt: new Date(),
        announcementId: ann.id
      };
      
      setNotifications(prev => [notification, ...prev]);
    });
  };

  // Crear notificación cuando se crea/edita una tarifa
  const triggerFareCreateNotifications = () => {
    const fareCreateAnnouncements = announcements.filter(ann => ann.showOnFareCreate);
    
    fareCreateAnnouncements.forEach(ann => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${ann.id}`,
        title: ann.title,
        message: ann.message,
        type: ann.type,
        isRead: false,
        createdAt: new Date(),
        announcementId: ann.id
      };
      
      setNotifications(prev => [notification, ...prev]);
    });
  };

  // Crear notificación al hacer login
  const triggerLoginNotifications = () => {
    const loginAnnouncements = announcements.filter(ann => ann.showOnLogin);
    
    loginAnnouncements.forEach(ann => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${ann.id}`,
        title: ann.title,
        message: ann.message,
        type: ann.type,
        isRead: false,
        createdAt: new Date(),
        announcementId: ann.id
      };
      
      setNotifications(prev => [notification, ...prev]);
    });
  };

  // Marcar notificación como leída
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  // Eliminar notificación
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return {
    announcements,
    notifications,
    loading,
    unreadCount,
    triggerTripCompleteNotifications,
    triggerFareCreateNotifications,
    triggerLoginNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead
  };
}
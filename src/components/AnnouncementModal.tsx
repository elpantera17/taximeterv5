import React from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  priority: number;
}

interface AnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
}

export function AnnouncementModal({ announcement, onClose, onMarkAsRead }: AnnouncementModalProps) {
  const handleClose = () => {
    if (onMarkAsRead) {
      onMarkAsRead(announcement.id);
    }
    onClose();
  };

  const getIcon = () => {
    switch (announcement.type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      case 'promotion':
        return <Star className="w-8 h-8 text-purple-600" />;
      default:
        return <Info className="w-8 h-8 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (announcement.type) {
      case 'success':
        return {
          bg: 'from-green-500 to-green-600',
          border: 'border-green-200',
          text: 'text-green-800',
          bgLight: 'bg-green-50'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500 to-yellow-600',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          bgLight: 'bg-yellow-50'
        };
      case 'error':
        return {
          bg: 'from-red-500 to-red-600',
          border: 'border-red-200',
          text: 'text-red-800',
          bgLight: 'bg-red-50'
        };
      case 'promotion':
        return {
          bg: 'from-purple-500 to-purple-600',
          border: 'border-purple-200',
          text: 'text-purple-800',
          bgLight: 'bg-purple-50'
        };
      default:
        return {
          bg: 'from-blue-500 to-blue-600',
          border: 'border-blue-200',
          text: 'text-blue-800',
          bgLight: 'bg-blue-50'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.bg} p-6 text-white relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4 pr-12">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{announcement.title}</h2>
              {announcement.priority > 1 && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm opacity-90">Prioridad Alta</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`${colors.bgLight} dark:bg-gray-700 rounded-lg p-4 border ${colors.border} dark:border-gray-600`}>
            <p className={`${colors.text} dark:text-gray-200 leading-relaxed`}>
              {announcement.message}
            </p>
          </div>

          {announcement.type === 'promotion' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  ¡Oferta especial disponible!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={handleClose}
            className={`w-full bg-gradient-to-r ${colors.bg} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
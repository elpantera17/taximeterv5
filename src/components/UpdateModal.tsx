import React from 'react';
import { Download, X, AlertTriangle, Smartphone } from 'lucide-react';

interface UpdateModalProps {
  currentVersion: string;
  requiredVersion: string;
  downloadUrl: string;
  onClose?: () => void;
  allowClose?: boolean;
}

export function UpdateModal({ 
  currentVersion, 
  requiredVersion, 
  downloadUrl, 
  onClose, 
  allowClose = false 
}: UpdateModalProps) {
  
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const handleCloseApp = () => {
    if (confirm('¿Estás seguro de que quieres cerrar la aplicación?')) {
      // En una PWA, esto cerrará la ventana o redirigirá
      if (window.close) {
        window.close();
      } else {
        // Fallback: redirigir a una página de cierre
        window.location.href = 'about:blank';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Actualización Requerida</h2>
              <p className="text-orange-100 text-sm">Nueva versión disponible</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Version Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Versión actual</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  v{currentVersion}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Versión requerida</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  v{requiredVersion}
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Tu versión está desactualizada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Para continuar usando Pantera Taximeter, necesitas actualizar a la versión más reciente. 
                Esta actualización incluye mejoras importantes de seguridad y nuevas funcionalidades.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              ✨ Novedades en v{requiredVersion}:
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Mejoras de rendimiento y estabilidad</li>
              <li>• Nuevas funciones VIP</li>
              <li>• Correcciones de seguridad importantes</li>
              <li>• Interfaz mejorada</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-medium">Importante:</p>
                <p>No podrás usar la aplicación hasta que actualices a la versión requerida.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={handleCloseApp}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cerrar App
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Descargar</span>
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            La descarga se abrirá en una nueva ventana
          </p>
        </div>
      </div>
    </div>
  );
}
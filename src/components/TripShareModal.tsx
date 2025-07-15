import React, { useRef } from 'react';
import { X, Share2, Download, MessageCircle } from 'lucide-react';
import { Trip } from '../types';
import { formatCurrency, formatDuration, formatDistance } from '../utils/calculations';
import html2canvas from 'html2canvas';

interface TripShareModalProps {
  trip: Trip;
  onClose: () => void;
}

export function TripShareModal({ trip, onClose }: TripShareModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleShare = async (platform: 'whatsapp' | 'general') => {
    if (!receiptRef.current) return;

    try {
      // Capturar la imagen del recibo
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], 'recibo-viaje.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          // Usar Web Share API si está disponible
          navigator.share({
            title: 'Recibo de Viaje - Pantera Taximeter',
            text: `Viaje completado por ${formatCurrency(trip.totalCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}`,
            files: [file]
          });
        } else if (platform === 'whatsapp') {
          // Fallback para WhatsApp
          const text = encodeURIComponent(
            `🚖 *Recibo de Viaje - Pantera Taximeter*\n\n` +
            `💰 Total: ${formatCurrency(trip.totalCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}\n` +
            `📏 Distancia: ${formatDistance(trip.distance, trip.fareCategory.measurementUnit)}\n` +
            `⏱️ Duración: ${formatDuration(trip.duration)}\n` +
            `📋 Tarifa: ${trip.fareCategory.name}\n` +
            `📅 Fecha: ${new Date(trip.startTime).toLocaleDateString('es-ES')}\n\n` +
            `¡Gracias por viajar con nosotros!`
          );
          window.open(`https://wa.me/?text=${text}`, '_blank');
        } else {
          // Descargar imagen
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'recibo-viaje.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Compartir Recibo
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Receipt */}
        <div className="p-6">
          <div ref={receiptRef} className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
            {/* Header del recibo */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <img 
                  src="/file_000000008d246230b67469ace47004d3 (1).png" 
                  alt="Pantera Logo" 
                  className="w-8 h-8 object-contain mr-2"
                />
                <h2 className="text-xl font-bold text-gray-900">Pantera Taximeter</h2>
              </div>
              <p className="text-sm text-gray-600">Recibo de Viaje</p>
            </div>

            {/* Información del viaje */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">
                  {new Date(trip.startTime).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">
                  {new Date(trip.startTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Distancia:</span>
                <span className="font-medium">
                  {formatDistance(trip.distance, trip.fareCategory.measurementUnit)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{formatDuration(trip.duration)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tarifa:</span>
                <span className="font-medium">{trip.fareCategory.name}</span>
              </div>

              {trip.dynamicMultiplier > 1.0 && (
                <div className="flex justify-between">
                  <span className="text-orange-600">Tarifa dinámica:</span>
                  <span className="font-medium text-orange-600">
                    {trip.dynamicMultiplier.toFixed(1)}x
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(trip.totalCost, trip.fareCategory.currencySymbol, trip.fareCategory.decimalDigits)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                ¡Gracias por viajar con nosotros!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Pantera Taximeter v1.0.1
              </p>
            </div>
          </div>
        </div>

        {/* Botones de compartir */}
        <div className="p-6 border-t dark:border-gray-700 space-y-3">
          <button
            onClick={() => handleShare('whatsapp')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Compartir por WhatsApp</span>
          </button>

          <button
            onClick={() => handleShare('general')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Compartir</span>
          </button>

          <button
            onClick={() => handleShare('general')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Imagen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
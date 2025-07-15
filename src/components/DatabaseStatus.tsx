import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DatabaseStatusProps {
  className?: string;
}

export function DatabaseStatus({ className = "" }: DatabaseStatusProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Check if Supabase credentials are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setIsConnected(false);
        setLastCheck(new Date());
        setIsLoading(false);
        return;
      }
      
      // Verificar conexión a Supabase
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key')
        .limit(1)
        .maybeSingle();
      
      setIsConnected(!error);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking Supabase connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Estado de la Base de Datos
            </h3>
          </div>
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Conexión:</span>
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Verificando...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Supabase</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">Local</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Almacenamiento:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isConnected ? 'Base de datos remota' : 'Navegador (localStorage)'}
            </span>
          </div>

          {/* Last Check */}
          {lastCheck && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Última verificación:</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {lastCheck.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Status Message */}
          <div className={`p-3 rounded-lg border ${
            isConnected 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-start space-x-2">
              {isConnected ? (
                <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5"></div>
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              )}
              <div className="text-xs">
                {isConnected ? (
                  <p className="text-green-700 dark:text-green-300">
                    Conectado a Supabase. Los datos se sincronizan automáticamente.
                  </p>
                ) : (
                  <p className="text-orange-700 dark:text-orange-300">
                    Usando almacenamiento local. Los datos se guardan en tu navegador.
                    <br />
                    <span className="font-medium">Nota:</span> Para conectar a Supabase, haz clic en "Connect to Supabase" en la parte superior.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
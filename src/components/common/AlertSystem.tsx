import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import type { Alert } from './useAlerts';

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onDismiss }) => {
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.duration && alert.duration > 0) {
        const timer = setTimeout(() => {
          onDismiss(alert.id);
        }, alert.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [alerts, onDismiss]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`max-w-sm p-4 rounded-lg border shadow-lg transform transition-all duration-300 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <h4 className="font-medium">{alert.title}</h4>
              <p className="text-sm mt-1 opacity-90">{alert.message}</p>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 
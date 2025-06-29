import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onDismiss }) => {
  // Use useRef to track timers and prevent memory leaks
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Set up auto-dismiss timers for alerts
  useEffect(() => {
    alerts.forEach(alert => {
      // Only set timer if it doesn't exist and duration is specified
      if (alert.duration && alert.duration > 0 && !timersRef.current.has(alert.id)) {
        const timer = setTimeout(() => {
          onDismiss(alert.id);
          timersRef.current.delete(alert.id);
        }, alert.duration);
        
        timersRef.current.set(alert.id, timer);
      }
    });

    // Clean up timers for alerts that no longer exist
    const currentAlertIds = new Set(alerts.map(alert => alert.id));
    timersRef.current.forEach((timer, alertId) => {
      if (!currentAlertIds.has(alertId)) {
        clearTimeout(timer);
        timersRef.current.delete(alertId);
      }
    });

    // Cleanup function
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [alerts, onDismiss]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
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
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{alert.title}</h4>
              <p className="text-sm mt-1 opacity-90">{alert.message}</p>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for managing alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Return the alert ID so it can be manually dismissed if needed
    return id;
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showSuccess = (title: string, message: string, duration = 5000) => {
    return addAlert({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 7000) => {
    return addAlert({ type: 'error', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 5000) => {
    return addAlert({ type: 'info', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration = 6000) => {
    return addAlert({ type: 'warning', title, message, duration });
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    addAlert,
    dismissAlert,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAllAlerts
  };
};
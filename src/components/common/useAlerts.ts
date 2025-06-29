import { useState } from 'react';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { ...alert, id }]);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showSuccess = (title: string, message: string, duration = 5000) => {
    addAlert({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 7000) => {
    addAlert({ type: 'error', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 5000) => {
    addAlert({ type: 'info', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration = 6000) => {
    addAlert({ type: 'warning', title, message, duration });
  };

  return {
    alerts,
    addAlert,
    dismissAlert,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
}; 
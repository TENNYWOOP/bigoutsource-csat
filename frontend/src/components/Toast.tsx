import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string, dur?: number) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg: string, dur?: number) => addToast(msg, 'error', dur), [addToast]);
  const warning = useCallback((msg: string, dur?: number) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg: string, dur?: number) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styles = {
    success: {
      bg: 'bg-white dark:bg-[#1e293b]',
      border: 'border-emerald-500/20 dark:border-emerald-500/30 border-l-4 border-l-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-white dark:bg-[#1e293b]',
      border: 'border-rose-500/20 dark:border-rose-500/30 border-l-4 border-l-rose-500',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-white dark:bg-[#1e293b]',
      border: 'border-amber-500/20 dark:border-amber-500/30 border-l-4 border-l-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-white dark:bg-[#1e293b]',
      border: 'border-sky-500/20 dark:border-sky-500/30 border-l-4 border-l-sky-500',
      icon: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
    },
  }[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.08)] border transition-all duration-300 animate-slide-in",
        styles.bg,
        styles.border
      )}
      role="alert"
    >
      {styles.icon}
      <div className="flex-1 text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-350 transition-colors p-0.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

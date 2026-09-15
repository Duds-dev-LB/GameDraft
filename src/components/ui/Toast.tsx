import { useEffect, FC } from 'react';
import { Toast as ToastType } from '@/types';

export interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export const Toast: FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const styles = {
    success: 'border-accent-500/20 bg-surface-800',
    error: 'border-danger-500/20 bg-surface-800',
    warning: 'border-warning-500/20 bg-surface-800',
    info: 'border-primary-500/20 bg-surface-800',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-xl shadow-lg w-full max-w-sm pointer-events-auto transform transition-all animate-slide-down ${styles[toast.type]}`}
    >
      <span className="text-xl leading-none mt-0.5">{icons[toast.type]}</span>
      <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

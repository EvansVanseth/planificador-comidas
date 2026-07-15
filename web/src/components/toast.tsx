'use client';

import { useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/icons';
import { toastDisplayText } from '@/lib/toast-display';

export default function ToastNotification({
  message,
  type = 'success',
  onDismiss,
}: {
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
}) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-auto">
      <div
        className={`flex items-start gap-3 rounded-xl px-5 py-3.5 text-white shadow-lg ${
          type === 'error' ? 'bg-[#DC2626]' : 'bg-[#007A55]'
        }`}
      >
        <span className="min-w-0 text-sm font-medium">{toastDisplayText(message)}</span>
        <button
          onClick={() => onDismissRef.current()}
          className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-white/20"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

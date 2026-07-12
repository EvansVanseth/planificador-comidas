'use client';

import { useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/icons';

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
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-white shadow-lg ${
          type === 'error' ? 'bg-[#DC2626]' : 'bg-[#009966]'
        }`}
      >
        <span className="text-sm font-medium">{message}</span>
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@/components/icons';

export default function ToastNotification({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  function dismiss() {
    setVisible(false);
    setTimeout(() => router.replace(window.location.pathname), 300);
  }

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl bg-[#009966] px-5 py-3.5 text-white shadow-lg">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-white/20"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

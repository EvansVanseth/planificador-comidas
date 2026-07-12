'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToastNotification from '@/components/toast';
import type { ToastItem } from '@/lib/toast-utils';

export default function ToastQueue({
  messages,
  path = '/dashboard',
}: {
  messages: ToastItem[];
  path?: string;
}) {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  function handleDismiss() {
    const next = index + 1;
    setIndex(next);

    if (next >= messages.length) {
      document.cookie = `toast_queue=; path=${path}; max-age=0`;
      setTimeout(() => router.refresh(), 350);
    }
  }

  if (index >= messages.length) return null;

  return (
    <ToastNotification
      message={messages[index].message}
      type={messages[index].type}
      onDismiss={handleDismiss}
    />
  );
}

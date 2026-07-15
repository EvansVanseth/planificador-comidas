'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  defaultValue?: string;
  placeholder?: string;
  paramName?: string;
  currentSearch?: string;
  className?: string;
};

export default function DebouncedSearch({
  defaultValue = '',
  placeholder = 'Buscar...',
  paramName = 'q',
  currentSearch = '',
  className = '',
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRender = useRef(true);
  const currentSearchRef = useRef(currentSearch);
  const paramNameRef = useRef(paramName);
  currentSearchRef.current = currentSearch;
  paramNameRef.current = paramName;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(currentSearchRef.current);
      if (value) {
        params.set(paramNameRef.current, value);
      } else {
        params.delete(paramNameRef.current);
      }
      const qs = params.toString();
      router.push(`?${qs}`);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [value, router]);

  return (
    <div className={`relative ${className}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="#4F617B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5l3 3" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3.5 text-sm transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
      />
    </div>
  );
}

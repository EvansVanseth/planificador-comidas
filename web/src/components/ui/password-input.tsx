'use client';

import { useState } from 'react';

type Props = {
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  defaultValue?: string;
  className?: string;
};

export function PasswordInput({ className, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20 ${className ?? ''}`}
          {...props}
        />
      </div>
      <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-xs text-[#4F617B] select-none">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="rounded border-[#E2E8F0] text-[#007A55] focus:ring-[#007A55]/20"
        />
        Ver contraseña
      </label>
    </div>
  );
}

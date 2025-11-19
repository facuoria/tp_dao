'use client';

import { ReactNode } from 'react';

export default function FormField({
  label, children, error,
}: { label: string; children: ReactNode; error?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error ? <p className="text-red-600 text-sm mt-1">{error}</p> : null}
    </div>
  );
}

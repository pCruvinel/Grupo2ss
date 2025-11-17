'use client';

import { Toaster as Sonner, toast } from 'sonner@2.0.3';

export { toast };

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#1F4788',
          border: '1px solid #e5e7eb',
        },
      }}
    />
  );
}
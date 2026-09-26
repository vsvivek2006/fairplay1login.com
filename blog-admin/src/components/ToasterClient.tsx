'use client';

import { Toaster } from 'sonner';

export default function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: '#12141F',
          borderColor: 'rgba(255, 184, 0, 0.25)',
          color: '#fff',
        },
      }}
    />
  );
}

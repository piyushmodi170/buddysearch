'use client';
import React, { useEffect, useState } from 'react';

export function UpiQr({ value, label }: { value: string; label?: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then((QR) => QR.toDataURL(value, { width: 280, margin: 1, errorCorrectionLevel: 'M' }))
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(value)}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        {src ? (
          <img src={src} alt={label || 'UPI QR code'} width={220} height={220} className="w-[220px] h-[220px]" />
        ) : (
          <div className="w-[220px] h-[220px] bg-gray-100 animate-pulse rounded-lg" />
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center max-w-[220px]">
        Scan with any UPI app
      </p>
    </div>
  );
}

export const isPhoneUpi = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
};

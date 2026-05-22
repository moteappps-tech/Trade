'use client';
import React, { useEffect, useRef } from 'react';

export function GoogleAdBanner() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('Adsense error', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center overflow-hidden bg-transparent min-h-[60px] my-4">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '60px' }}
        data-ad-client="ca-app-pub-1380756274291827"
        data-ad-slot="4849909138"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

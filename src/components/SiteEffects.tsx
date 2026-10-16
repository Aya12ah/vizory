'use client';
import { useEffect } from 'react';

// Google Analytics was removed. Clear the cookies and stored choice it left with earlier visitors.
function clearGA() {
  const host = location.hostname, parts = host.split('.');
  const domains = ['', host, '.' + host, '.' + parts.slice(-2).join('.')];
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name.indexOf('_ga') !== 0) return;
    domains.forEach((d) => {
      document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
    });
  });
  try { localStorage.removeItem('vz-consent'); } catch {}
}

export function SiteEffects() {
  useEffect(clearGA, []);
  return null;
}

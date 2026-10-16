import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import type { Lang } from '@/i18n/lang';
import { Footer } from './Footer';
import { SiteEffects } from './SiteEffects';
import '@/styles/globals.css';

export const rootMetadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F8F6' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1110' },
  ],
};

// Theme before first paint: the visitor's own choice, else light from 07:00 to 19:00 on their clock and dark otherwise.
const THEME_SCRIPT = `(function () { var t; try { t = localStorage.getItem('vz-theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') { var h = new Date().getHours(); t = h >= 7 && h < 19 ? 'light' : 'dark'; }
  document.documentElement.setAttribute('data-theme', t); })();`;

/** The <html> shell shared by the English and the Danish root layout. */
export function RootLayout({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    // The theme script sets data-theme before React loads, so the attribute differs from the server HTML.
    <html lang={lang} data-lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- kept as before; next/font is a planned follow-up */}
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="wrap">
          {children}
          <Footer lang={lang} />
        </div>
        <SiteEffects />
        <Analytics />
      </body>
    </html>
  );
}

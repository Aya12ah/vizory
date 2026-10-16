import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { type ReactNode, ViewTransition } from 'react';
import type { Lang } from '@/i18n/lang';
import { Footer } from './Footer';
import { Header } from './Header';
import { SiteEffects } from './SiteEffects';
import '@/styles/globals.css';

// Space Grotesk is downloaded from Google Fonts when the site is built and served from vizory.dk,
// so visitors' browsers never contact Google.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

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
    <html lang={lang} className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <div className="max-w-[1120px] mx-auto px-(--gutter) min-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex flex-col">
          <Header lang={lang} />
          {/* Moving between pages crossfades the content; header and footer stay put. */}
          <ViewTransition default="page">
            <main>{children}</main>
          </ViewTransition>
          <Footer lang={lang} />
        </div>
        <SiteEffects />
        <Analytics />
      </body>
    </html>
  );
}

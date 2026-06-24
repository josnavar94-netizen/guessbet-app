import type { Metadata, Viewport } from 'next';
import './globals.css';
import OrientationLock from './OrientationLock';

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://guessbet.vercel.app'),
  title: 'GuessBet · Mundial 2026',
  description: 'Ingresa las cuotas de tu casa de apuestas y en segundos sabes si conviene apostar — basado en 20 años de datos reales de fútbol.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GuessBet',
  },
  icons: {
    apple: '/icon-192.png?v=2',
    icon: '/icon-192.png?v=2',
  },
  openGraph: {
    title: 'GuessBet · Mundial 2026',
    description: 'La ventaja que el mercado no quiere que tengas. Analiza partidos del Mundial 2026 con un modelo entrenado en 20 años de datos.',
    url: 'https://guessbet.vercel.app',
    siteName: 'GuessBet',
    images: ['/icon-512.png'],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'GuessBet · Mundial 2026',
    description: 'La ventaja que el mercado no quiere que tengas.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GuessBet" />
      </head>
      <body>
        <OrientationLock />
        {children}
      </body>
    </html>
  );
}

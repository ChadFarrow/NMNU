import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { getSiteName } from '@/lib/site-config'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import ErrorBoundary from '@/components/ErrorBoundary'
import ClientErrorBoundary from '@/components/ClientErrorBoundary'
import { ToastContainer } from '@/components/Toast'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { AudioProvider } from '@/contexts/AudioContext'
import { BitcoinConnectProvider } from '@/contexts/BitcoinConnectContext'
import { LightningProvider } from '@/contexts/LightningContext'
import GlobalNowPlayingBar from '@/components/GlobalNowPlayingBar'



const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || getSiteName() || 'Music Platform',
  description: 'Value4Value music platform powered by Lightning Network',
  manifest: '/manifest.json',
  // Icons removed - add your own favicon and PWA icons
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: getSiteName() || 'Music Platform',
    // startupImage removed - add your own when ready
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': getSiteName() || 'Music Platform',
    'mobile-web-app-capable': 'yes',
    'format-detection': 'telephone=no',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1f2937',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="prefetch" href="/api/albums?source=static-cached" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {/* Chrome/browser polyfill for @getalby/bitcoin-connect - must load before any modules */}
        <Script src="/chrome-polyfill.js" strategy="beforeInteractive" />
        <ClientErrorBoundary>
          <ErrorBoundary>
            <LightningProvider>
              <AudioProvider>
                <BitcoinConnectProvider>
                  <div className="min-h-screen bg-gray-50 relative">
                    {/* Content overlay with iOS safe area padding */}
                    <div className="relative z-10 pt-ios">
                      {children}
                    </div>
                  </div>
                  <GlobalNowPlayingBar />
                  <ToastContainer />
                </BitcoinConnectProvider>
              </AudioProvider>
            </LightningProvider>
          </ErrorBoundary>
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          <PerformanceMonitor />
        </ClientErrorBoundary>
      </body>
    </html>
  )
} 
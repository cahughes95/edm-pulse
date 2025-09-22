import type { Metadata } from 'next'
import './globals.css'

const siteName = process.env.SITE_NAME || 'EDM Pulse'
const siteUrl = process.env.SITE_URL || 'https://www.edm-pulse.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} · Nightlife & Electronic Shows in Los Angeles`, template: `%s · ${siteName}` },
  description: 'Find upcoming electronic music events in Los Angeles. Updated frequently.',
  openGraph: { title: siteName, description: 'Find upcoming electronic events in LA.', url: siteUrl, siteName, locale: 'en_US', type: 'website' },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsense = process.env.ADSENSE_CLIENT_ID
  return (
    <html lang="en">
      <head>
        {adsense ? <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`} crossOrigin="anonymous" /> : null}
      </head>
      <body>
        <header className="border-b border-white/10">
          <div className="container flex items-center justify-between py-4">
            <a href="/" className="text-lg font-semibold">🎧 {siteName}</a>
            <nav className="text-sm text-gray-300">
              <a className="mr-4 hover:text-white" href="/#today">Today</a>
              <a className="mr-4 hover:text-white" href="/#weekend">Weekend</a>
              <a className="hover:text-white" href="/about">About</a>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-10 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {siteName}. Not affiliated with any venue or promoter.</p>
          <p className="mt-2">Sources include public listings. Please verify details with the official ticket page.</p>
        </footer>
      </body>
    </html>
  )
}

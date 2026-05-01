/**
 * @fileoverview Root layout component for Next.js application.
 * Provides global styles and context providers to all pages.
 * @author Muhammad Moin U Din (BCSF22M023)
 * @author Muhammad Junaid Malik (BCSF22M031)
 * @author Muhammad Subhan Ul Haq (BCSF22M043)
 */

import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'trackifyr',
  description: 'trackifyr - Cognitive Load Estimation via Natural Activity Monitoring',
}

const THEME_BOOT = `(function(){try{var k='trackifyr-theme';var v=localStorage.getItem(k);var dark=v==='dark'||(v!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Script id="trackifyr-theme-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}




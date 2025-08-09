import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import './globals.css'

export const metadata: Metadata = {
  title: 'andre arcaina',
  description: 'My own portfolio website!',
  icons: { 
    other: [
      { rel: 'icon', url: '/images/icon.svg', type: 'image/svg+xml' }
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="theme-transition">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <Nav />
            <main>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

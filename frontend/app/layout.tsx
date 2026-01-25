import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { SWRProvider } from '@/components/providers/swr-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Abasto - Sistema de Inventario',
    template: '%s | Abasto',
  },
  description: 'Sistema profesional de gestión de inventario en tiempo real',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/abasto-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/abasto-logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRProvider>
            {children}
          </SWRProvider>
        </ThemeProvider>

      </body>
    </html>
  )
}

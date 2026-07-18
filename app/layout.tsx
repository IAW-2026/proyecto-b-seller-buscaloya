import { ClerkProvider } from '@clerk/nextjs'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import "./globals.css";

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#dc2626', // El rojo de PeYa (Tailwind red-600)
          colorBackground: '#ffffff',
          colorText: '#0f172a', // slate-900
        }
      }}
    >
      <html lang="es" className={geist.variable}>
        {/* Forzamos un tema claro global y tipografía limpia */}
        <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen">
          <Toaster position="bottom-center" richColors />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
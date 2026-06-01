/*Global styles and ClerkProvider setup for authentication context across the app.*/
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

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
      <html lang="es">
        {/* Forzamos un tema claro global y tipografía limpia */}
        <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
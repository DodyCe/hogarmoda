import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'HogarModa – Tienda de Hogar y Moda en Colombia',
  description: 'Encuentra las mejores sábanas, cortinas, zapatos y artículos del hogar. Envíos contraentrega en toda Colombia.',
  keywords: 'hogar, moda, sábanas, cortinas, zapatos, tendidos, Colombia, contraentrega',
  openGraph: {
    title: 'HogarModa',
    description: 'Tu tienda de hogar y moda con entregas contraentrega en Colombia.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

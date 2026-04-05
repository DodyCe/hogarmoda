import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Livende – Tienda de Hogar y Moda en Montería',
  description: 'Encuentra las mejores sábanas, cortinas, zapatos y artículos del hogar. Envíos contraentrega en toda Montería.',
  keywords: 'hogar, moda, sábanas, cortinas, zapatos, tendidos, Montería, contraentrega',
  openGraph: {
    title: 'Livende',
    description: 'Tu tienda de hogar y moda con entregas contraentrega en Montería.',
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

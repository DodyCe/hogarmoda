import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Permitir imágenes de dominios externos (URL de productos)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**' }, // permitir cualquier dominio
    ],
    unoptimized: true, // para compatibilidad en Vercel con URLs externas
  },
};

export default nextConfig;

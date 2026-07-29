// app/layout.tsx
// NDURANCE AI — Root Layout

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NDURANCE AI — Intelligent Motion Analysis',
  description:
    'Real-time posture, gait, running and exercise form analysis using AI and computer vision. ' +
    'Three synchronized cameras. Live skeleton overlay. Biomechanical insights.',
  keywords: [
    'sports analytics', 'motion analysis', 'pose estimation', 'gait analysis',
    'running form', 'AI coach', 'biomechanics', 'MediaPipe', 'exercise form',
  ],
  authors: [{ name: 'NDURANCE AI' }],
  robots: 'index, follow',
  openGraph: {
    title: 'NDURANCE AI',
    description: 'Intelligent Human Motion Analysis & Performance Monitoring',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#050810',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

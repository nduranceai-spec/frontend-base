// app/layout.tsx — Spider Track AI Root Layout
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spider Track AI — Elite Running Performance Analysis',
  description:
    'AI-powered treadmill running analysis using three synchronized cameras. ' +
    'Real-time posture tracking, gait pattern recognition, and biomechanical insights ' +
    'for elite sports performance. Left, Back, and Right camera capture.',
  keywords: [
    'spider track AI', 'running analysis', 'gait analysis', 'posture analysis',
    'sports performance', 'AI coaching', 'biomechanics', 'treadmill analysis',
    'three camera system', 'motion capture',
  ],
  authors: [{ name: 'Spider Track AI' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Spider Track AI — Elite Running Performance',
    description: 'AI-powered three-camera running analysis platform',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#03010A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-spider-void text-spider-white antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

'use client';
// app/dashboard/layout.tsx — Dashboard Shell
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SpiderNav from '@/components/ui/SpiderNav';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';
import { getToken } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setAuthorized(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen bg-spider-void" />;
  }

  return (
    <div className="relative min-h-screen bg-spider-void flex">
      <SpiderWebBackground intensity="subtle" />
      <SpiderNav />
      {/* Main content — offset for sidebar */}
      <main className="flex-1 ml-[240px] min-h-screen relative z-10 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

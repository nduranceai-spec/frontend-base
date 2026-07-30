'use client';
// app/dashboard/layout.tsx — Dashboard Shell
import SpiderNav from '@/components/ui/SpiderNav';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

import { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { useIsTablet } from '@/hooks/useMediaQuery';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
  showBack?: boolean;
}

export default function Layout({ children, title, showBottomNav = true, showBack }: LayoutProps) {
  const isTablet = useIsTablet();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${isTablet ? 'md:ml-sidebar' : ''}`}>
        <Header title={title} showBack={showBack} />
        <main className={`flex-1 overflow-y-auto ${isTablet ? 'p-screen-md' : 'pb-16'}`}>
          <div className={`max-w-content mx-auto ${isTablet ? 'px-screen-md py-section-md' : 'p-screen space-y-section'}`}>
            {children}
          </div>
        </main>
        {!isTablet && showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
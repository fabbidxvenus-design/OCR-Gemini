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
    <div className="flex min-h-screen flex-col bg-surface">
      <Sidebar />
      <div className={`flex flex-1 flex-col ${isTablet ? 'md:ml-sidebar' : ''}`}>
        <Header title={title} showBack={showBack} />
        <main className={`flex-1 overflow-y-auto ${isTablet ? '' : 'pb-20'}`}>
          <div className={`mx-auto max-w-content ${isTablet ? 'px-8 py-6' : 'space-y-4 p-screen'}`}>
            {children}
          </div>
        </main>
        {!isTablet && showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

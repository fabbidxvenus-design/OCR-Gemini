import { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
  showBack?: boolean;
}

export default function Layout({ children, title, showBottomNav = true, showBack }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header title={title} showBack={showBack} />
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
import { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
}

export default function Layout({ children, title, showBottomNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header title={title} />
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface LayoutProps {
  isAdmin?: boolean;
}

export default function Layout({ isAdmin }: LayoutProps) {
  return (
    <div className="min-h-screen pb-16 lg:pb-0" style={{ background: 'var(--bg)' }}>
      <Header isAdmin={isAdmin} />
      <Sidebar isAdmin={isAdmin} />
      <main className="lg:ml-64 pt-16 lg:pt-20 min-h-screen">
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}

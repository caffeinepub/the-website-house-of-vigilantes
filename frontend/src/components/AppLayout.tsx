import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import Navigation from './Navigation';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSidebarState } from '../hooks/useSidebarState';
import { useGetCallerUserRole } from '../hooks/useQueries';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isCollapsed, toggle } = useSidebarState();
  
  // Fetch user role early to enable role-based UI
  const { data: roleData } = useGetCallerUserRole();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />
      <main
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

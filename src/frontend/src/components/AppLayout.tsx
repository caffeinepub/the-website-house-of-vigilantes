import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ThemeToggle from './ThemeToggle';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSidebarState } from '../hooks/useSidebarState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isCollapsed, toggle } = useSidebarState();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
      
      // Add smooth fade transition before navigation
      setTimeout(() => {
        navigate({ to: '/' });
        setIsLoggingOut(false);
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen bg-background transition-opacity duration-300",
      isLoggingOut ? 'opacity-0' : 'opacity-100'
    )}>
      <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        // Desktop: adjust margin based on sidebar state
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        {/* Header with mobile menu toggle and log out button */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-vangogh-yellow/20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="lg:hidden hover:bg-vangogh-yellow/20"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Spacer for mobile */}
            <div className="flex-1 lg:hidden" />

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  disabled={isLoggingOut}
                  className="rounded-full border-vangogh-blue text-vangogh-blue hover:bg-vangogh-blue hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

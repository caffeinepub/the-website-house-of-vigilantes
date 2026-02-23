import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ThemeToggle from './ThemeToggle';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className={`flex min-h-screen bg-background transition-opacity duration-300 ${isLoggingOut ? 'opacity-0' : 'opacity-100'}`}>
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col transition-all duration-300">
        {/* Header with Log Out button */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-vangogh-yellow/20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-end gap-4">
            <ThemeToggle />
            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="outline"
                disabled={isLoggingOut}
                className="rounded-full border-vangogh-blue text-vangogh-blue hover:bg-vangogh-blue hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </Button>
            )}
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

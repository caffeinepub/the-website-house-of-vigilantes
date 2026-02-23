import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, BookOpen, Users, TrendingUp, Upload, User, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  authRequired?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/home', icon: <Home className="h-5 w-5" /> },
  { label: 'Books', path: '/browse', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Authors', path: '/authors', icon: <Users className="h-5 w-5" /> },
  { label: 'Trending', path: '/home', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Upload Book', path: '/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Dashboard', path: '/author/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, authRequired: true },
  { label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const [isExpanded, setIsExpanded] = useState(true);

  const currentPath = routerState.location.pathname;
  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  // Filter nav items based on authentication
  const visibleNavItems = navItems.filter(item => {
    if (item.authRequired && !isAuthenticated) {
      return false;
    }
    return true;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ease-in-out',
          'hidden lg:flex flex-col',
          isExpanded ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className={cn(
            'p-6 border-b border-border transition-all duration-300',
            !isExpanded && 'p-4'
          )}>
            {isExpanded ? (
              <div>
                <h2 className="text-lg font-serif font-bold text-vangogh-blue">
                  Book Haven
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Van Gogh Inspired
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vangogh-blue to-vangogh-yellow flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive = currentPath === item.path;
              
              const buttonContent = (
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'text-left font-medium',
                    isActive
                      ? 'bg-gradient-to-r from-vangogh-gold to-vangogh-yellow text-vangogh-blue shadow-lg font-bold'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    !isExpanded && 'justify-center px-2'
                  )}
                >
                  <span className={cn(isActive && 'scale-110 transition-transform')}>
                    {item.icon}
                  </span>
                  {isExpanded && <span>{item.label}</span>}
                </button>
              );

              if (!isExpanded) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.path}>{buttonContent}</div>;
            })}
          </nav>

          {/* Toggle Button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full hover:bg-accent"
            >
              {isExpanded ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Simple overlay version */}
      <div className="lg:hidden">
        {/* Mobile navigation would go here - simplified for now */}
      </div>
    </TooltipProvider>
  );
}

import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, BookOpen, Users, TrendingUp, Upload, User, ChevronLeft, ChevronRight, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  authRequired?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/home', icon: <Home className="h-5 w-5" /> },
  { label: 'Books', path: '/browse', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Authors', path: '/authors', icon: <Users className="h-5 w-5" /> },
  { label: 'Trending', path: '/trending', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Upload Book', path: '/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" />, authRequired: true },
];

const adminItems: NavItem[] = [
  { label: 'Admin Panel', path: '/admin', icon: <Shield className="h-5 w-5" />, adminOnly: true },
  { label: 'Reviews', path: '/admin/review', icon: <BookOpen className="h-5 w-5" />, adminOnly: true },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" />, adminOnly: true },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const currentPath = routerState.location.pathname;
  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  const visibleNavItems = navItems.filter(item => {
    if (item.authRequired && !isAuthenticated) {
      return false;
    }
    return true;
  });

  const visibleAdminItems = isAdmin ? adminItems : [];

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ease-in-out flex flex-col',
          // Mobile: slide in from left as overlay
          'lg:translate-x-0',
          isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
          // Desktop: fixed width based on collapsed state
          isCollapsed ? 'lg:w-16' : 'w-64 lg:w-64'
        )}
      >
        {/* Header with toggle button */}
        <div className={cn(
          'p-4 border-b border-border transition-all duration-300 flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <h2 className="text-lg font-serif font-bold text-vangogh-blue truncate">
              THE HOUSE OF VIGILANTES
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "hover:bg-vangogh-yellow/20 flex-shrink-0",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
            {visibleNavItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <li key={item.path}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            'w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200',
                            'hover:bg-vangogh-yellow/20 hover:text-vangogh-blue',
                            isActive
                              ? 'bg-vangogh-blue text-white shadow-vangogh-glow'
                              : 'text-foreground/70'
                          )}
                          aria-label={item.label}
                        >
                          {item.icon}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        'hover:bg-vangogh-yellow/20 hover:text-vangogh-blue',
                        isActive
                          ? 'bg-vangogh-blue text-white shadow-vangogh-glow'
                          : 'text-foreground/70'
                      )}
                    >
                      {item.icon}
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Admin section */}
          {visibleAdminItems.length > 0 && (
            <>
              <div className={cn("my-4", isCollapsed ? "px-2" : "px-3")}>
                <div className="border-t border-border" />
              </div>
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </p>
                </div>
              )}
              <ul className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
                {visibleAdminItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <li key={item.path}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={cn(
                                'w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200',
                                'hover:bg-vangogh-yellow/20 hover:text-vangogh-blue',
                                isActive
                                  ? 'bg-vangogh-blue text-white shadow-vangogh-glow'
                                  : 'text-foreground/70'
                              )}
                              aria-label={item.label}
                            >
                              {item.icon}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                            'hover:bg-vangogh-yellow/20 hover:text-vangogh-blue',
                            isActive
                              ? 'bg-vangogh-blue text-white shadow-vangogh-glow'
                              : 'text-foreground/70'
                          )}
                        >
                          {item.icon}
                          <span className="font-medium truncate">{item.label}</span>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>
      </aside>
    </TooltipProvider>
  );
}

import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, BookOpen, Users, TrendingUp, Upload, User, ChevronLeft, ChevronRight, LayoutDashboard, BarChart3, FolderHeart, Shield, MessageSquare, UsersRound } from 'lucide-react';
import { useState } from 'react';
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
  { label: 'Collections', path: '/collections', icon: <FolderHeart className="h-5 w-5" /> },
  { label: 'Discussions', path: '/discussions', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Social', path: '/social', icon: <UsersRound className="h-5 w-5" />, authRequired: true },
  { label: 'Trending', path: '/home', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Upload Book', path: '/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Dashboard', path: '/author/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, authRequired: true },
  { label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
];

const adminItems: NavItem[] = [
  { label: 'Admin', path: '/admin', icon: <Shield className="h-5 w-5" />, adminOnly: true },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" />, adminOnly: true },
  { label: 'Collections', path: '/admin/collections', icon: <FolderHeart className="h-5 w-5" />, adminOnly: true },
  { label: 'Moderation', path: '/admin/moderation', icon: <Shield className="h-5 w-5" />, adminOnly: true },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [isExpanded, setIsExpanded] = useState(true);

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
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ease-in-out',
          'hidden lg:flex flex-col',
          isExpanded ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            'p-6 border-b border-border transition-all duration-300',
            !isExpanded && 'p-4'
          )}>
            <div className="flex items-center justify-between">
              {isExpanded && (
                <h2 className="text-xl font-serif font-bold text-vangogh-blue">
                  THE HOUSE OF VIGILANTES
                </h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-auto hover:bg-vangogh-yellow/20"
              >
                {isExpanded ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {visibleNavItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <li key={item.path}>
                    {isExpanded ? (
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
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ) : (
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
                          >
                            {item.icon}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>

            {visibleAdminItems.length > 0 && (
              <>
                <div className="my-4 px-3">
                  <div className="border-t border-border" />
                </div>
                <ul className="space-y-1 px-3">
                  {visibleAdminItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                      <li key={item.path}>
                        {isExpanded ? (
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
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ) : (
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
                              >
                                {item.icon}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  );
}

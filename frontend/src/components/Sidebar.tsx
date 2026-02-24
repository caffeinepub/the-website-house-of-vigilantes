import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, BookOpen, Users, TrendingUp, Upload, User, ChevronLeft, ChevronRight, Shield, BarChart3, Settings, MessageSquare, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { UserRole } from '../backend';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  authRequired?: boolean;
  adminOnly?: boolean;
  authorOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/home', icon: <Home className="h-5 w-5" /> },
  { label: 'Books', path: '/browse', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Authors', path: '/authors', icon: <Users className="h-5 w-5" /> },
  { label: 'Trending', path: '/trending', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Upload Book', path: '/upload', icon: <Upload className="h-5 w-5" />, authRequired: true },
  { label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" />, authRequired: true },
];

const adminNavItems: NavItem[] = [
  { label: 'Books', path: '/admin', icon: <BookOpen className="h-5 w-5" />, adminOnly: true },
  { label: 'Reviews', path: '/admin/review', icon: <MessageSquare className="h-5 w-5" />, adminOnly: true },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" />, adminOnly: true },
  { label: 'Collections', path: '/admin/collections', icon: <FolderOpen className="h-5 w-5" />, adminOnly: true },
  { label: 'Moderation', path: '/admin/moderation', icon: <Settings className="h-5 w-5" />, adminOnly: true },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { identity } = useInternetIdentity();
  const { data: roleData, isLoading: roleLoading } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  const isAdmin = roleData?.systemRole === UserRole.admin;
  const isAuthor = roleData?.isAuthor || false;

  const filteredNavItems = navItems.filter(item => {
    if (item.authRequired && !isAuthenticated) return false;
    return true;
  });

  const filteredAdminItems = adminNavItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = currentPath === item.path;
    
    const button = (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 transition-all',
          isActive && 'bg-vangogh-yellow text-vangogh-blue hover:bg-vangogh-yellow/90',
          !isActive && 'hover:bg-vangogh-yellow/10',
          isCollapsed && 'justify-center px-2'
        )}
        onClick={() => navigate({ to: item.path })}
      >
        {item.icon}
        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
      </Button>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-background border-r border-vangogh-yellow/20 transition-all duration-300 z-40',
        'flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-vangogh-yellow/20">
        {!isCollapsed && (
          <h2 className="font-serif font-bold text-lg text-vangogh-blue">Menu</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hover:bg-vangogh-yellow/10"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </div>

        {/* Author Dashboard */}
        {isAuthenticated && isAuthor && (
          <div className="pt-4 mt-4 border-t border-vangogh-yellow/20 space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">AUTHOR</p>
            )}
            <NavButton item={{ label: 'Dashboard', path: '/author/dashboard', icon: <BarChart3 className="h-5 w-5" /> }} />
          </div>
        )}

        {/* Admin Section */}
        {isAuthenticated && isAdmin && filteredAdminItems.length > 0 && (
          <div className="pt-4 mt-4 border-t border-vangogh-yellow/20 space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 flex items-center gap-2">
                <Shield className="h-3 w-3" />
                ADMIN
              </p>
            )}
            {filteredAdminItems.map((item) => (
              <NavButton key={item.path} item={item} />
            ))}
            {/* User Management - SuperAdmin only */}
            {!roleLoading && (
              <NavButton item={{ label: 'User Management', path: '/admin/users', icon: <Users className="h-5 w-5" />, adminOnly: true }} />
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

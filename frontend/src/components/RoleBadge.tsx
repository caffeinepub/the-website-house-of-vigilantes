import { useGetCallerUserRole } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Feather, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '../backend';

export default function RoleBadge() {
  const { data: roleData, isLoading } = useGetCallerUserRole();

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (!roleData) {
    return null;
  }

  const { systemRole, isAuthor } = roleData;

  // Don't show badge for guests
  if (systemRole === UserRole.guest) {
    return null;
  }

  // Determine display role
  let displayRole = 'User';
  let icon = <User className="h-3 w-3" />;
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let className = 'text-xs font-medium';

  if (systemRole === UserRole.admin) {
    // Check if super admin (would need backend support to distinguish)
    displayRole = 'Admin';
    icon = <Crown className="h-3 w-3" />;
    variant = 'default';
    className = 'text-xs font-medium bg-vangogh-blue text-white border-vangogh-blue';
  } else if (isAuthor) {
    displayRole = 'Author';
    icon = <Feather className="h-3 w-3" />;
    variant = 'outline';
    className = 'text-xs font-medium bg-vangogh-yellow/20 text-vangogh-blue border-vangogh-yellow';
  }

  return (
    <Badge variant={variant} className={className}>
      <span className="flex items-center gap-1">
        {icon}
        {displayRole}
      </span>
    </Badge>
  );
}

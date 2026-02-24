import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserRole, useAssignCoAdmin, usePromoteToAuthor } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, Feather, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { data: roleData, isLoading: roleLoading } = useGetCallerUserRole();
  const assignCoAdmin = useAssignCoAdmin();
  const promoteToAuthor = usePromoteToAuthor();

  const isSuperAdmin = roleData?.systemRole === UserRole.admin;

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      toast.error('Access denied. Super Admin privileges required.');
      navigate({ to: '/home' });
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only Super Admin can manage user roles.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-vangogh-blue mb-2 flex items-center gap-3">
          <Crown className="h-8 w-8 text-vangogh-yellow" />
          User Management
        </h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-vangogh-blue flex items-center gap-2">
            <Users className="h-6 w-6" />
            User List
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">User Management</p>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Backend support for listing all users is being implemented. This feature will allow you to view all registered users and manage their roles.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-vangogh-blue/10 rounded-lg">
              <Shield className="h-4 w-4 text-vangogh-blue" />
              <span className="text-sm font-medium">Assign Co-Admin</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-vangogh-yellow/20 rounded-lg">
              <Feather className="h-4 w-4 text-vangogh-blue" />
              <span className="text-sm font-medium">Promote to Author</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

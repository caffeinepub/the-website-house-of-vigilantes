import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCollectionsPage() {
  const navigate = useNavigate();
  const { data: roleData, isLoading: roleLoading } = useGetCallerUserRole();

  const isAdmin = roleData?.systemRole === UserRole.admin;

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate({ to: '/home' });
    }
  }, [isAdmin, roleLoading, navigate]);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-vangogh-blue mb-2">
          Collections Management
        </h1>
        <p className="text-muted-foreground">Manage curated book collections</p>
      </div>

      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">Collections Management</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Backend support for curated collections is being implemented. This feature will allow you to create and manage themed book collections.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

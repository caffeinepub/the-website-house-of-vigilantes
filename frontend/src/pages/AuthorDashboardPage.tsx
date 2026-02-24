import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useGetCallerUserProfile, useDeleteAccount } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import AuthorBookManager from '../components/AuthorBookManager';
import AuthorAnalytics from '../components/AuthorAnalytics';
import AuthorSeriesManager from '../components/AuthorSeriesManager';
import AuthorReaderInteraction from '../components/AuthorReaderInteraction';
import EditAuthorProfileDialog from '../components/EditAuthorProfileDialog';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { BookOpen, BarChart3, List, MessageSquare, Settings, AlertCircle, Feather } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthorDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear } = useInternetIdentity();
  const { data: roleData, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: userProfile } = useGetCallerUserProfile();
  const deleteAccountMutation = useDeleteAccount();

  const [selectedBookIsbn, setSelectedBookIsbn] = useState<string | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Load extended profile from localStorage
  const [extendedProfile, setExtendedProfile] = useState({
    bio: '',
    website: '',
    social: {
      twitter: '',
      facebook: '',
      instagram: '',
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem('authorExtendedProfile');
    if (stored) {
      try {
        setExtendedProfile(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse extended profile:', e);
      }
    }
  }, []);

  const isAuthenticated = !!identity;
  const isAuthor = roleData?.isAuthor || false;
  const isAdmin = roleData?.systemRole === UserRole.admin;

  useEffect(() => {
    if (!roleLoading && !isAuthor && !isAdmin && isAuthenticated) {
      toast.error('Access denied. Author status required.');
      navigate({ to: '/home' });
    }
  }, [isAuthor, isAdmin, roleLoading, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert>
          <Feather className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the author dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthor && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need author status to access this page. Please contact an admin to request author promotion.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync(null);
      toast.success('Account deleted successfully');
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-vangogh-blue mb-2">
          Author Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your books and track your readership</p>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="books" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Books</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="series" className="gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Series</span>
          </TabsTrigger>
          <TabsTrigger value="readers" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Readers</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <AuthorBookManager onSelectBook={setSelectedBookIsbn} />
        </TabsContent>

        <TabsContent value="analytics">
          <AuthorAnalytics selectedBookIsbn={selectedBookIsbn} />
        </TabsContent>

        <TabsContent value="series">
          <AuthorSeriesManager />
        </TabsContent>

        <TabsContent value="readers">
          <AuthorReaderInteraction />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-vangogh-blue mb-4">
                  Author Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <Button
                      onClick={() => setEditProfileOpen(true)}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Edit Author Profile
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-vangogh-yellow/20">
                    <h4 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h4>
                    <Button
                      onClick={() => setDeleteModalOpen(true)}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditAuthorProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        currentProfile={userProfile}
        extendedProfile={extendedProfile}
      />

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

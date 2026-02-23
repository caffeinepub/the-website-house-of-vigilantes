import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGetCallerUserProfile, useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Edit, BookOpen, BarChart3, List, MessageSquare, Settings, Trash2 } from 'lucide-react';
import AuthPrompt from '../components/AuthPrompt';
import EditAuthorProfileDialog from '../components/EditAuthorProfileDialog';
import AuthorBookManager from '../components/AuthorBookManager';
import AuthorAnalytics from '../components/AuthorAnalytics';
import AuthorSeriesManager from '../components/AuthorSeriesManager';
import AuthorReaderInteraction from '../components/AuthorReaderInteraction';
import DashboardStatsCard from '../components/DashboardStatsCard';
import DeleteAccountModal from '../components/DeleteAccountModal';

export default function AuthorDashboardPage() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [selectedBookIsbn, setSelectedBookIsbn] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  // Load extended profile from localStorage
  const extendedProfile = isAuthenticated
    ? JSON.parse(localStorage.getItem(`extendedProfile_${identity?.getPrincipal().toString()}`) || '{}')
    : {};

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync(null);
      await clear();
      queryClient.clear();
      toast.success('Account deleted successfully');
      setTimeout(() => {
        navigate({ to: '/' });
      }, 300);
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-vangogh-blue/10 rounded-full">
              <User className="h-16 w-16 text-vangogh-blue" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Author Dashboard Access Required
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please log in to access your author dashboard and manage your books.
          </p>
          <Button
            onClick={() => setShowAuthPrompt(true)}
            className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-8"
          >
            Log In to Continue
          </Button>
        </div>
        <AuthPrompt
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          message="Please log in to access your author dashboard, manage your books, and view analytics."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Author Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.name || 'Author'}!
            </p>
          </div>
          <Button
            onClick={() => setEditProfileOpen(true)}
            variant="outline"
            className="rounded-full border-2 border-vangogh-blue/30 hover:bg-vangogh-blue/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardStatsCard
            icon={<BookOpen className="h-6 w-6" />}
            label="Total Books"
            value="0"
            trend="+0 this month"
          />
          <DashboardStatsCard
            icon={<User className="h-6 w-6" />}
            label="Total Readers"
            value="0"
            trend="+0 this month"
          />
          <DashboardStatsCard
            icon={<BarChart3 className="h-6 w-6" />}
            label="Avg. Rating"
            value="0.0"
            trend="No ratings yet"
          />
          <DashboardStatsCard
            icon={<MessageSquare className="h-6 w-6" />}
            label="Reviews"
            value="0"
            trend="No reviews yet"
          />
        </div>
      </div>

      {/* Dashboard Tabs */}
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
          <div className="space-y-6">
            <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-6">
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                Account Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    onClick={() => setDeleteModalOpen(true)}
                    variant="destructive"
                    className="rounded-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <EditAuthorProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        currentProfile={userProfile}
        extendedProfile={extendedProfile}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={deleteAccountMutation.isPending}
      />
    </div>
  );
}

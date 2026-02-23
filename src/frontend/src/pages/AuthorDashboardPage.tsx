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
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteAccountMutation = useDeleteAccount();

  const isAuthenticated = !!identity;

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccountMutation.mutateAsync();
      toast.success('Your account has been permanently deleted');
      await clear();
      queryClient.clear();
      setDeleteModalOpen(false);
      
      // Add smooth fade transition before navigation
      setTimeout(() => {
        navigate({ to: '/' });
        setIsDeleting(false);
      }, 300);
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
      setDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };

  // Show auth prompt for guests
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center p-4">
          <div className="text-center">
            <User className="h-24 w-24 mx-auto text-vangogh-blue mb-6" />
            <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-4">
              Author Dashboard
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Please log in to access your author dashboard
            </p>
            <Button
              onClick={() => setShowAuthPrompt(true)}
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-8 py-6 text-lg"
            >
              Login to Continue
            </Button>
          </div>
        </div>
        <AuthPrompt
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          message="Please log in to access your author dashboard and manage your books."
        />
      </>
    );
  }

  // Loading state
  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Load extended profile data from localStorage (bio, avatar, social links stored in frontend until backend supports)
  const storedExtendedProfile = localStorage.getItem('authorExtendedProfile');
  const extendedProfile = storedExtendedProfile 
    ? JSON.parse(storedExtendedProfile)
    : {
        bio: 'Passionate writer creating stories that inspire and entertain readers worldwide.',
        website: '',
        social: {
          twitter: '',
          facebook: '',
          instagram: '',
        },
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Author Profile Header */}
        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-8 mb-8 shadow-vangogh-glow">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-vangogh-blue to-vangogh-yellow flex items-center justify-center shadow-lg">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-vangogh-blue">
                    {userProfile?.name || 'Author'}
                  </h1>
                  <p className="text-muted-foreground">Author Dashboard</p>
                </div>
                <Button
                  onClick={() => setEditProfileOpen(true)}
                  variant="outline"
                  className="rounded-full border-vangogh-blue text-vangogh-blue hover:bg-vangogh-blue hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                {extendedProfile.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="books" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6 bg-card border-2 border-vangogh-yellow/30 rounded-2xl p-1">
                <TabsTrigger value="books" className="rounded-xl data-[state=active]:bg-vangogh-blue data-[state=active]:text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Books</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-vangogh-blue data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="series" className="rounded-xl data-[state=active]:bg-vangogh-blue data-[state=active]:text-white">
                  <List className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Series</span>
                </TabsTrigger>
                <TabsTrigger value="readers" className="rounded-xl data-[state=active]:bg-vangogh-blue data-[state=active]:text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Readers</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-vangogh-blue data-[state=active]:text-white">
                  <Settings className="h-4 w-4 mr-2" />
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
                <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-8 shadow-vangogh-glow">
                  <h2 className="text-2xl font-serif font-bold text-vangogh-blue mb-6">
                    Account Settings
                  </h2>
                  
                  {/* Delete Account Section */}
                  <div className="border-2 border-destructive/30 rounded-2xl p-6 bg-destructive/5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                          <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-bold text-destructive mb-2">
                          Delete Account
                        </h3>
                        <p className="text-foreground/80 mb-4 leading-relaxed">
                          Permanently delete your account and all associated data. This action cannot be undone.
                          All your books, analytics, reading progress, and ratings will be removed.
                        </p>
                        <Button
                          onClick={() => setDeleteModalOpen(true)}
                          variant="destructive"
                          className="rounded-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete My Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-xl font-serif font-bold text-vangogh-blue mb-4">
                Quick Stats
              </h3>
              <DashboardStatsCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Total Books"
                value="0"
              />
              <DashboardStatsCard
                icon={<BarChart3 className="h-5 w-5" />}
                label="Total Reads"
                value="0"
              />
              <DashboardStatsCard
                icon={<User className="h-5 w-5" />}
                label="Avg Rating"
                value="0.0"
              />
            </div>
          </div>
        </div>
      </div>

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
        isDeleting={isDeleting}
      />
    </div>
  );
}

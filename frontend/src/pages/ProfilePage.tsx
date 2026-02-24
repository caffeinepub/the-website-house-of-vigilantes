import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useBookmarkedBooks,
  useGetAllBooks,
  useDeleteAccount,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, BookOpen, Bookmark, Star, Edit, LogOut, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EditProfileDialog from '../components/EditProfileDialog';
import DeleteAccountModal from '../components/DeleteAccountModal';
import AuthPrompt from '../components/AuthPrompt';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: bookmarkedBooks, isLoading: bookmarksLoading } = useBookmarkedBooks();
  const { data: allBooks, isLoading: booksLoading } = useGetAllBooks();
  const deleteAccount = useDeleteAccount();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!identity;

  // Calculate reading statistics
  const stats = useMemo(() => {
    if (!allBooks || !identity) return { booksRead: 0, bookmarks: 0, ratingsGiven: 0 };

    const userPrincipal = identity.getPrincipal().toString();
    const userBooks = allBooks.filter(
      book => book.uploaderId.toString() === userPrincipal
    );

    return {
      booksRead: userBooks.length,
      bookmarks: bookmarkedBooks?.length || 0,
      ratingsGiven: 0, // Placeholder - would need ratings data
    };
  }, [allBooks, bookmarkedBooks, identity]);

  // Extract genre preferences from bookmarked books
  const genrePreferences = useMemo(() => {
    if (!bookmarkedBooks) return [];

    const genreCount = new Map<string, number>();
    bookmarkedBooks.forEach(book => {
      genreCount.set(book.genre, (genreCount.get(book.genre) || 0) + 1);
    });

    return Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
  }, [bookmarkedBooks]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
      setTimeout(() => {
        navigate({ to: '/' });
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(null);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="flex justify-center">
            <div className="p-6 bg-vangogh-blue/10 rounded-full">
              <User className="h-16 w-16 text-vangogh-blue" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Profile Access Required
          </h2>
          <p className="text-muted-foreground max-w-md">
            Please log in to view and manage your profile, reading statistics, and preferences.
          </p>
          <Button
            onClick={() => setAuthPromptOpen(true)}
            className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-8"
          >
            Log In to View Profile
          </Button>
        </div>
        <AuthPrompt
          open={authPromptOpen}
          onOpenChange={setAuthPromptOpen}
          message="Please log in to view and edit your profile, track your reading statistics, and manage your preferences."
        />
      </div>
    );
  }

  if (profileLoading || booksLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  // Placeholder followers/following counts
  const followersCount = 234;
  const followingCount = 89;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="rounded-3xl border-2 border-vangogh-yellow/30 bg-gradient-to-br from-vangogh-blue/5 to-vangogh-yellow/5">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-vangogh-blue/30 to-vangogh-yellow/30 flex items-center justify-center">
                  <User className="h-16 w-16 text-vangogh-blue" />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                    {userProfile?.name || 'Anonymous User'}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono break-all md:break-normal">
                    {identity?.getPrincipal().toString().slice(0, 20)}...
                  </p>
                  
                  {/* Followers/Following Counters */}
                  <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-vangogh-blue">{followersCount}</span>
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-vangogh-blue">{followingCount}</span>
                      <span className="text-muted-foreground">Following</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button
                    onClick={() => setEditDialogOpen(true)}
                    variant="outline"
                    className="rounded-full border-2 border-vangogh-blue/30 hover:bg-vangogh-blue/10 w-full md:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="outline"
                    className="rounded-full border-2 border-vangogh-yellow/30 hover:bg-vangogh-yellow/10 w-full md:w-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                  </Button>
                  <Button
                    onClick={() => setDeleteModalOpen(true)}
                    variant="outline"
                    className="rounded-full border-2 border-destructive/30 hover:bg-destructive/10 text-destructive w-full md:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="rounded-3xl border-2 border-vangogh-blue/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-2">
                <BookOpen className="h-8 w-8 mx-auto text-vangogh-blue" />
                <p className="text-3xl font-bold text-foreground">{stats.booksRead}</p>
                <p className="text-sm text-muted-foreground">Books Uploaded</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2 border-vangogh-yellow/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-2">
                <Bookmark className="h-8 w-8 mx-auto text-vangogh-yellow" />
                <p className="text-3xl font-bold text-foreground">{stats.bookmarks}</p>
                <p className="text-sm text-muted-foreground">Bookmarks</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2 border-vangogh-blue/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-2">
                <Star className="h-8 w-8 mx-auto text-vangogh-yellow fill-vangogh-yellow" />
                <p className="text-3xl font-bold text-foreground">{stats.ratingsGiven}</p>
                <p className="text-sm text-muted-foreground">Ratings Given</p>
              </CardContent>
            </Card>
          </div>

          {/* Genre Preferences */}
          {genrePreferences.length > 0 && (
            <Card className="rounded-3xl border-2 border-vangogh-yellow/20">
              <CardHeader>
                <CardTitle className="font-serif">Your Favorite Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {genrePreferences.map(genre => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-vangogh-blue/10 text-vangogh-blue border border-vangogh-blue/30 rounded-full px-4 py-2"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Bookmarks */}
          {bookmarkedBooks && bookmarkedBooks.length > 0 && (
            <Card className="rounded-3xl border-2 border-vangogh-blue/20">
              <CardHeader>
                <CardTitle className="font-serif">Recent Bookmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bookmarkedBooks.slice(0, 4).map(book => (
                    <div
                      key={book.isbn}
                      className="cursor-pointer group"
                      onClick={() => navigate({ to: `/book/${book.isbn}` })}
                    >
                      <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-2 group-hover:shadow-lg transition-shadow">
                        <img
                          src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentProfile={userProfile}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={deleteAccount.isPending}
      />
    </div>
  );
}

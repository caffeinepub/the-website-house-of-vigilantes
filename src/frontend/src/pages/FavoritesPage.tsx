import { useBookmarkedBooks } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import BookGrid from '../components/BookGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import AuthPrompt from '../components/AuthPrompt';

export default function FavoritesPage() {
  const { identity } = useInternetIdentity();
  const { data: bookmarkedBooks, isLoading, error } = useBookmarkedBooks();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-starry-background flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="flex justify-center">
            <div className="p-6 bg-starry-secondary/10 rounded-full">
              <Heart className="h-16 w-16 text-starry-secondary" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-starry-secondary">
            Login Required
          </h2>
          <p className="text-muted-foreground max-w-md">
            Please log in to view and manage your favorite books collection.
          </p>
          <Button
            onClick={() => setAuthPromptOpen(true)}
            className="bg-starry-secondary hover:bg-starry-secondary/90 text-white rounded-full px-8"
          >
            Log In to View Favorites
          </Button>
        </div>
        <AuthPrompt
          open={authPromptOpen}
          onOpenChange={setAuthPromptOpen}
          message="Please log in to view your favorite books and manage your personal collection."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-starry-background">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-starry-primary/20 via-starry-background to-starry-background border-b border-starry-accent/30">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-starry-secondary/10 rounded-full">
                <Heart className="h-12 w-12 md:h-16 md:w-16 text-starry-secondary fill-starry-secondary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-starry-secondary tracking-wide">
              My Favorites
            </h1>
            <p className="text-base md:text-lg text-starry-accent font-serif leading-relaxed max-w-2xl mx-auto">
              Your curated collection of beloved books, saved for easy access and future reading.
            </p>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-3xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load your favorites. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
                <Skeleton className="h-5 md:h-6 w-3/4 rounded-full" />
                <Skeleton className="h-3 md:h-4 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : bookmarkedBooks && bookmarkedBooks.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-starry-primary/10 rounded-full">
                <Heart className="h-16 w-16 text-starry-accent/50" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-starry-secondary">
                No Favorites Yet
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                Start building your collection by bookmarking books you love!
              </p>
            </div>
            <Link to="/browse">
              <Button 
                size="lg" 
                className="bg-starry-secondary hover:bg-starry-secondary/90 text-white rounded-full px-8 py-6 text-base font-medium shadow-starry-glow transition-all duration-300"
              >
                Browse Books
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm md:text-base text-muted-foreground">
                You have <span className="font-semibold text-starry-secondary">{bookmarkedBooks?.length || 0}</span> favorite {bookmarkedBooks?.length === 1 ? 'book' : 'books'}
              </p>
            </div>
            <BookGrid books={bookmarkedBooks || []} />
          </>
        )}
      </section>
    </div>
  );
}

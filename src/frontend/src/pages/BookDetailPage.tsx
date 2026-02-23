import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBook, useIsCallerAdmin, useGetUserBookProgress, useUpdateReadingProgress, useIsBookBookmarked, useToggleBookmark, useBookRatings, useAddRating, useBookAverageRating } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Calendar, Hash, AlertCircle, BookOpen, Plus, Minus, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import PdfViewer from '../components/PdfViewer';
import StarRating from '../components/StarRating';

export default function BookDetailPage() {
  const { isbn } = useParams({ from: '/book/$isbn' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: book, isLoading, error } = useGetBook(isbn);
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: progress, refetch: refetchProgress } = useGetUserBookProgress(isbn);
  const updateProgress = useUpdateReadingProgress();
  const { data: isBookmarked, isLoading: bookmarkLoading } = useIsBookBookmarked(isbn);
  const toggleBookmark = useToggleBookmark();
  const { data: ratings } = useBookRatings(isbn);
  const { data: averageRating } = useBookAverageRating(isbn);
  const addRating = useAddRating();

  const [pagesRead, setPagesRead] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);

  const isAuthenticated = !!identity;

  // Update local state when progress data loads
  useEffect(() => {
    if (progress) {
      setPagesRead(Number(progress.pagesRead));
    }
  }, [progress]);

  // Find user's existing rating
  useEffect(() => {
    if (ratings && identity) {
      const myRating = ratings.find(r => r.userId.toString() === identity.getPrincipal().toString());
      if (myRating) {
        setUserRating(Number(myRating.stars));
      }
    }
  }, [ratings, identity]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark books');
      return;
    }

    try {
      await toggleBookmark.mutateAsync(isbn);
      toast.success(isBookmarked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleRatingChange = async (stars: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to rate books');
      return;
    }

    try {
      await addRating.mutateAsync({ bookIsbn: isbn, stars });
      setUserRating(stars);
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleUpdateProgress = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to track reading progress');
      return;
    }

    if (pagesRead < 0 || (book && pagesRead > Number(book.pageCount))) {
      toast.error(`Pages read must be between 0 and ${book?.pageCount}`);
      return;
    }

    try {
      await updateProgress.mutateAsync({
        bookIsbn: isbn,
        pagesRead: BigInt(pagesRead),
      });
      await refetchProgress();
      toast.success('Reading progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const incrementPages = () => {
    if (book && pagesRead < Number(book.pageCount)) {
      setPagesRead(prev => prev + 1);
    }
  };

  const decrementPages = () => {
    if (pagesRead > 0) {
      setPagesRead(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Skeleton className="aspect-[2/3] w-full max-w-md mx-auto" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert variant="destructive" className="rounded-3xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Book not found or failed to load. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const progressPercentage = book.pageCount > 0n ? (Number(progress?.pagesRead || 0n) / Number(book.pageCount)) * 100 : 0;

  return (
    <div className="min-h-screen bg-starry-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 rounded-full hover:bg-starry-accent/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Book Cover */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <img
                src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                alt={book.title}
                className="w-full rounded-3xl shadow-2xl border-4 border-starry-accent/20"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-starry-secondary mb-3 leading-tight">
                  {book.title}
                </h1>
                <p className="text-xl md:text-2xl text-starry-accent font-serif mb-4">
                  by {book.author}
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleBookmarkToggle}
                      disabled={!isAuthenticated || bookmarkLoading || toggleBookmark.isPending}
                      className="rounded-full shrink-0"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-5 w-5 fill-starry-secondary text-starry-secondary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!isAuthenticated ? 'Log in to bookmark' : isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Rating Display and Input */}
            <div className="space-y-3">
              {averageRating !== null && averageRating !== undefined && (
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} size="lg" count={ratings?.length || 0} />
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} average
                  </span>
                </div>
              )}
              
              {isAuthenticated && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {userRating > 0 ? 'Your rating:' : 'Rate this book:'}
                  </Label>
                  <StarRating 
                    rating={userRating} 
                    interactive 
                    size="lg"
                    onChange={handleRatingChange}
                  />
                </div>
              )}
            </div>

            <div className="prose prose-sm md:prose-base max-w-none">
              <p className="text-foreground leading-relaxed">{book.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-starry-secondary" />
                <span className="text-muted-foreground">Published:</span>
                <span className="font-medium">{book.publicationYear.toString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Hash className="h-4 w-4 md:h-5 md:w-5 text-starry-secondary" />
                <span className="text-muted-foreground">Genre:</span>
                <span className="font-medium">{book.genre}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base col-span-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-starry-secondary" />
                <span className="text-muted-foreground">Pages:</span>
                <span className="font-medium">{book.pageCount.toString()}</span>
              </div>
            </div>

            {/* Reading Progress Tracker */}
            {isAuthenticated && (
              <Card className="border-starry-accent/30 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Reading Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress?.pagesRead.toString() || '0'} of {book.pageCount.toString()} pages
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="pages-read" className="text-sm font-medium">
                      Update Pages Read
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decrementPages}
                        disabled={pagesRead === 0}
                        className="rounded-full shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="pages-read"
                        type="number"
                        min="0"
                        max={Number(book.pageCount)}
                        value={pagesRead}
                        onChange={(e) => setPagesRead(Math.max(0, Math.min(Number(book.pageCount), parseInt(e.target.value) || 0)))}
                        className="text-center rounded-2xl"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={incrementPages}
                        disabled={pagesRead >= Number(book.pageCount)}
                        className="rounded-full shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleUpdateProgress}
                      disabled={updateProgress.isPending}
                      className="w-full rounded-full bg-starry-secondary hover:bg-starry-secondary/90"
                    >
                      {updateProgress.isPending ? 'Updating...' : 'Save Progress'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <Alert className="rounded-3xl border-starry-accent/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Log in to track your reading progress, bookmark books, and rate them.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        {book.pdfFileUrl && isAuthenticated && (
          <div className="mt-8">
            <PdfViewer pdfUrl={book.pdfFileUrl} title={book.title} />
          </div>
        )}
      </div>
    </div>
  );
}

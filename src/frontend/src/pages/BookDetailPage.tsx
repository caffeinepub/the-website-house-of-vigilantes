import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, Star, Share2, MessageSquare } from 'lucide-react';
import { SiFacebook, SiX, SiLinkedin } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetBook, useToggleBookmark, useIsBookBookmarked, useAddRating, useGetBookAverageRating, useGetUserBookProgress, useUpdateReadingProgress, useTrackBookView } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PdfViewer from '../components/PdfViewer';
import StarRating from '../components/StarRating';
import AuthPrompt from '../components/AuthPrompt';
import { toast } from 'sonner';

// Placeholder review data
const PLACEHOLDER_REVIEWS = [
  {
    id: '1',
    username: 'BookLover42',
    rating: 5,
    text: 'Absolutely captivating! Could not put it down. The author\'s storytelling is masterful.',
    timestamp: '2 days ago',
  },
  {
    id: '2',
    username: 'ReadingEnthusiast',
    rating: 4,
    text: 'Great read with compelling characters. Highly recommend for fans of the genre.',
    timestamp: '1 week ago',
  },
  {
    id: '3',
    username: 'LiteraryExplorer',
    rating: 5,
    text: 'One of the best books I\'ve read this year. The plot twists kept me engaged throughout.',
    timestamp: '2 weeks ago',
  },
];

export default function BookDetailPage() {
  const { isbn } = useParams({ from: '/book/$isbn' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: book, isLoading } = useGetBook(isbn);
  const { data: isBookmarked = false } = useIsBookBookmarked(isbn);
  const { data: averageRating } = useGetBookAverageRating(isbn);
  const { data: progress } = useGetUserBookProgress(isbn);
  const toggleBookmark = useToggleBookmark();
  const addRating = useAddRating();
  const updateProgress = useUpdateReadingProgress();
  const trackView = useTrackBookView();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isbn && isAuthenticated) {
      trackView.mutate(isbn);
    }
  }, [isbn, isAuthenticated]);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    toggleBookmark.mutate(isbn, {
      onSuccess: () => {
        toast.success(isBookmarked ? 'Removed from favorites' : 'Added to favorites');
      },
    });
  };

  const handleRating = (stars: number) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    setUserRating(stars);
    addRating.mutate({ bookIsbn: isbn, stars }, {
      onSuccess: () => {
        toast.success('Rating submitted!');
      },
    });
  };

  const handleShare = () => {
    toast.info('Share functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue mb-4"></div>
          <p className="text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-vangogh-blue mb-4">Book Not Found</h2>
          <Button onClick={() => navigate({ to: '/browse' })} className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full">
            Browse Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/browse' })}
            className="mb-6 hover:bg-vangogh-yellow/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-6 shadow-vangogh-glow sticky top-8">
                <img
                  src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                  alt={book.title}
                  className="w-full rounded-2xl shadow-lg mb-6"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                  }}
                />
                <div className="space-y-4">
                  <Button
                    onClick={handleBookmark}
                    variant={isBookmarked ? 'default' : 'outline'}
                    className="w-full rounded-full"
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  
                  {/* Share Button */}
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full rounded-full border-vangogh-blue/30 hover:bg-vangogh-blue/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  {/* Social Share Icons */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-vangogh-blue/10"
                      onClick={handleShare}
                    >
                      <SiFacebook className="h-5 w-5 text-[#1877F2]" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-vangogh-blue/10"
                      onClick={handleShare}
                    >
                      <SiX className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-vangogh-blue/10"
                      onClick={handleShare}
                    >
                      <SiLinkedin className="h-5 w-5 text-[#0A66C2]" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Rate this book</p>
                    <StarRating
                      rating={userRating}
                      onChange={handleRating}
                      size="lg"
                      interactive
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-6 md:p-8 shadow-vangogh-glow">
                <div className="mb-6">
                  <Badge className="mb-4 bg-vangogh-blue text-white">{book.genre}</Badge>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-vangogh-blue mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <StarRating rating={averageRating || 0} size="md" />
                      <span className="text-sm text-muted-foreground">
                        {averageRating ? averageRating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Number(book.pageCount)} pages
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Number(book.publicationYear)}
                    </span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  <h3 className="text-xl font-serif font-bold text-vangogh-blue mb-3">Description</h3>
                  <p className="text-foreground/80 leading-relaxed">{book.description}</p>
                </div>

                {progress && (
                  <div className="mb-8">
                    <h3 className="text-xl font-serif font-bold text-vangogh-blue mb-3">Reading Progress</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-vangogh-blue h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(Number(progress.pagesRead) / Number(book.pageCount)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {Number(progress.pagesRead)} / {Number(book.pageCount)} pages
                      </span>
                    </div>
                  </div>
                )}

                {book.pdfFileUrl && (
                  <div className="mt-8">
                    <h3 className="text-xl font-serif font-bold text-vangogh-blue mb-4">Read Book</h3>
                    <PdfViewer pdfUrl={book.pdfFileUrl} />
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <Card className="rounded-3xl border-2 border-vangogh-yellow/30">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-vangogh-blue" />
                    Reader Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {PLACEHOLDER_REVIEWS.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-vangogh-blue/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-vangogh-blue">
                              {review.username.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{review.username}</p>
                            <p className="text-xs text-muted-foreground">{review.timestamp}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-foreground/80 leading-relaxed pl-13">
                        {review.text}
                      </p>
                      {review.id !== PLACEHOLDER_REVIEWS[PLACEHOLDER_REVIEWS.length - 1].id && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground italic">
                      Review functionality will be available once backend support is added
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AuthPrompt
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        message="Please log in to bookmark books, rate them, and track your reading progress."
      />
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Bookmark, Share2, MessageSquare } from 'lucide-react';
import { SiFacebook, SiX, SiLinkedin } from 'react-icons/si';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
  useGetBook,
  useToggleBookmark,
  useIsBookBookmarked,
  useAddRating,
  useGetBookAverageRating,
  useGetUserBookProgress,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PdfViewer from '../components/PdfViewer';
import StarRating from '../components/StarRating';
import AuthPrompt from '../components/AuthPrompt';
import { toast } from 'sonner';

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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const isAuthenticated = !!identity;

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
    addRating.mutate(
      { bookIsbn: isbn, stars },
      {
        onSuccess: () => {
          toast.success('Rating submitted!');
        },
      }
    );
  };

  const handleShare = () => {
    toast.info('Share functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Book Not Found</h2>
          <Button onClick={() => navigate({ to: '/browse' })}>Browse Books</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/browse' })}
            className="mb-6 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Book Cover and Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="aspect-[2/3] w-full max-w-sm mx-auto lg:max-w-none overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleBookmark}
                    variant={isBookmarked ? 'default' : 'outline'}
                    className="w-full min-h-[44px]"
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>

                  <Button onClick={handleShare} variant="outline" className="w-full min-h-[44px]">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button size="icon" variant="ghost" onClick={handleShare} className="min-w-[44px] min-h-[44px]">
                      <SiFacebook className="h-5 w-5 text-[#1877F2]" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleShare} className="min-w-[44px] min-h-[44px]">
                      <SiX className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleShare} className="min-w-[44px] min-h-[44px]">
                      <SiLinkedin className="h-5 w-5 text-[#0A66C2]" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Rate this book</p>
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRating}
                      size="lg"
                      interactive
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Badge className="mb-3">{book.genre}</Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
                    <p className="text-lg sm:text-xl text-muted-foreground mb-4">by {book.author}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StarRating rating={averageRating || 0} size="md" />
                        <span className="text-muted-foreground">
                          {averageRating ? averageRating.toFixed(1) : 'No ratings'}
                        </span>
                      </div>
                      <span className="text-muted-foreground">{Number(book.pageCount)} pages</span>
                      <span className="text-muted-foreground">{Number(book.publicationYear)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                  </div>

                  {progress && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Reading Progress</h3>
                        <div className="space-y-2">
                          <div className="w-full bg-muted rounded-full h-3">
                            <div
                              className="bg-primary h-3 rounded-full transition-all"
                              style={{
                                width: `${(Number(progress.pagesRead) / Number(book.pageCount)) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground text-right">
                            {Number(progress.pagesRead)} / {Number(book.pageCount)} pages
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {book.pdfFileUrl && (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <PdfViewer pdfUrl={book.pdfFileUrl} title={book.title} />
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reader Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {PLACEHOLDER_REVIEWS.map((review, index) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold">{review.username.charAt(0)}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-medium">{review.username}</p>
                              <p className="text-xs text-muted-foreground">{review.timestamp}</p>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                      {index < PLACEHOLDER_REVIEWS.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground text-center italic pt-4">
                    Review functionality will be available once backend support is added
                  </p>
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

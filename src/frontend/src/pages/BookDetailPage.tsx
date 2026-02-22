import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBook, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, Hash, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function BookDetailPage() {
  const { isbn } = useParams({ from: '/book/$isbn' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: book, isLoading, error } = useGetBook(isbn);
  const { data: isAdmin } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[2/3] w-full max-w-md mx-auto" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ? 'Failed to load book details.' : 'Book not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user can view this book
  const canView = 
    book.approvalStatus.__kind__ === 'approved' || 
    isAdmin || 
    (identity && book.uploaderId.toString() === identity.getPrincipal().toString());

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This book is not available for viewing.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-8 gap-2 hover:gap-3 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Book Cover */}
          <div className="flex justify-center lg:justify-end">
            <Card className="overflow-hidden shadow-book-hover border-border/50 max-w-md w-full">
              <CardContent className="p-0">
                <img
                  src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium">by {book.author}</p>
            </div>

            {book.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Published: {Number(book.publicationYear)}</span>
              </div>
              {book.isbn && book.isbn.trim() && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-5 w-5" />
                  <span className="font-medium">ISBN: {book.isbn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

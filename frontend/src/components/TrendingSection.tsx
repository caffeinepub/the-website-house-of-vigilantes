import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBookAverageRating } from '../hooks/useQueries';
import type { Book } from '../backend';

interface TrendingSectionProps {
  books: Book[];
  onBookClick?: (book: Book) => void;
  loading?: boolean;
}

function TrendingBookCard({ book, index, onBookClick }: { book: Book; index: number; onBookClick?: (book: Book) => void }) {
  const { data: averageRating, isLoading: ratingLoading } = useGetBookAverageRating(book.isbn);

  return (
    <Card
      className="cursor-pointer hover:shadow-vangogh-glow transition-all duration-300 hover:border-vangogh-gold/40 bg-card border-2"
      onClick={() => onBookClick?.(book)}
    >
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Rank Badge */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vangogh-gold/30 to-vangogh-yellow/30 flex items-center justify-center border-2 border-vangogh-gold/40 shadow-lg">
              <span className="text-2xl font-bold text-vangogh-gold">
                #{index + 1}
              </span>
            </div>
          </div>

          {/* Book Cover */}
          <div className="flex-shrink-0">
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-24 h-32 object-cover rounded-xl shadow-md border-2 border-border"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
              }}
            />
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-serif font-bold text-xl line-clamp-1 text-foreground">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              by {book.author}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {book.genre}
              </Badge>
              {!ratingLoading && averageRating !== null && averageRating !== undefined && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-vangogh-gold text-vangogh-gold" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrendingSection({ books, onBookClick, loading = false }: TrendingSectionProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-vangogh-gold/20 to-vangogh-yellow/20 border-2 border-vangogh-gold/30">
            <TrendingUp className="h-8 w-8 text-vangogh-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground">Trending & Popular</h2>
            <p className="text-muted-foreground">Most loved books right now</p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          No trending books available yet
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-vangogh-gold/20 to-vangogh-yellow/20 border-2 border-vangogh-gold/30">
          <TrendingUp className="h-8 w-8 text-vangogh-gold" />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Trending & Popular</h2>
          <p className="text-muted-foreground">Most loved books right now</p>
        </div>
      </div>

      <div className="grid gap-4">
        {books.map((book, index) => (
          <TrendingBookCard
            key={book.isbn}
            book={book}
            index={index}
            onBookClick={onBookClick}
          />
        ))}
      </div>
    </div>
  );
}

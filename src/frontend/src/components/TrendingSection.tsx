import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';
import type { Book } from '../backend';

interface TrendingSectionProps {
  books: Book[];
  onBookClick?: (book: Book) => void;
}

export default function TrendingSection({ books, onBookClick }: TrendingSectionProps) {
  // Mock ratings for trending books (in real app, would come from backend)
  const getRating = (index: number) => (5 - index * 0.2).toFixed(1);

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
          <Card
            key={book.isbn}
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
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-vangogh-gold text-vangogh-gold" />
                      <span className="font-semibold">{getRating(index)}</span>
                      <span className="text-muted-foreground">
                        ({Math.floor(Math.random() * 500 + 100)} ratings)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

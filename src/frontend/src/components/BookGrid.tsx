import { Link } from '@tanstack/react-router';
import type { Book } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark } from 'lucide-react';
import { useIsCallerAdmin, useIsBookBookmarked, useGetBookAverageRating } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import StarRating from './StarRating';

interface BookGridProps {
  books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
  const { data: isAdmin } = useIsCallerAdmin();

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No books in the collection yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {books.map((book) => (
        <BookCard key={book.isbn} book={book} isAdmin={isAdmin} />
      ))}
    </div>
  );
}

function BookCard({ book, isAdmin }: { book: Book; isAdmin?: boolean }) {
  const { identity } = useInternetIdentity();
  const { data: isBookmarked } = useIsBookBookmarked(book.isbn);
  const { data: averageRating } = useGetBookAverageRating(book.isbn);

  return (
    <Link
      to="/book/$isbn"
      params={{ isbn: book.isbn }}
      className="group"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-vangogh-glow hover:scale-105 border-2 border-transparent hover:border-vangogh-gold/40 bg-card relative">
        <CardContent className="p-0">
          <div className="aspect-[2/3] overflow-hidden bg-muted relative">
            <img
              src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
              }}
            />
            {isAdmin && book.approvalStatus.__kind__ !== 'approved' && (
              <div className="absolute top-2 right-2">
                <Badge 
                  variant={book.approvalStatus.__kind__ === 'pending' ? 'secondary' : 'destructive'}
                  className="shadow-md text-xs"
                >
                  {book.approvalStatus.__kind__ === 'pending' ? 'Pending' : 'Rejected'}
                </Badge>
              </div>
            )}
            {identity && isBookmarked && (
              <div className="absolute top-2 left-2">
                <Bookmark className="h-5 w-5 fill-vangogh-gold text-vangogh-gold drop-shadow-md" />
              </div>
            )}
          </div>
          <div className="p-3 md:p-4 space-y-2">
            <h3 className="font-serif font-bold line-clamp-2 text-sm md:text-base group-hover:text-vangogh-gold transition-colors">
              {book.title}
            </h3>
            <p className="text-muted-foreground line-clamp-1 text-xs md:text-sm">{book.author}</p>
            {averageRating !== null && averageRating !== undefined && (
              <div className="pt-1">
                <StarRating rating={averageRating} size="sm" />
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              {book.genre}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

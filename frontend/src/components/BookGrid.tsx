import React from 'react';
import { Link } from '@tanstack/react-router';
import { Book } from '../backend';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { useGetBookAverageRating, useIsBookBookmarked } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import StarRating from './StarRating';
import { Bookmark } from 'lucide-react';
import { useGetCallerUserRole } from '../hooks/useQueries';

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
}

function BookCard({ book }: { book: Book }) {
  const { identity } = useInternetIdentity();
  const { data: averageRating } = useGetBookAverageRating(book.isbn);
  const { data: isBookmarked } = useIsBookBookmarked(book.isbn);
  const { data: userRole } = useGetCallerUserRole();

  const isAdmin = userRole?.systemRole === 'admin';
  const showApprovalBadge = isAdmin && book.approvalStatus.__kind__ !== 'approved';

  return (
    <Link
      to="/book/$isbn"
      params={{ isbn: book.isbn }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-lg bg-card shadow-md transition-all hover:shadow-xl hover:scale-105">
        {/* Book Cover */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          <img
            src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
            alt={book.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/generated/placeholder-cover.dim_400x600.png';
            }}
          />

          {/* Bookmark Indicator */}
          {identity && isBookmarked && (
            <div className="absolute top-2 right-2 bg-primary/90 rounded-full p-1.5">
              <Bookmark className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
          )}

          {/* Approval Status Badge */}
          {showApprovalBadge && (
            <div className="absolute top-2 left-2">
              <Badge variant={book.approvalStatus.__kind__ === 'pending' ? 'secondary' : 'destructive'}>
                {book.approvalStatus.__kind__ === 'pending' ? 'Pending' : 'Rejected'}
              </Badge>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-3 sm:p-4 space-y-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {book.author}
          </p>

          {/* Rating */}
          {averageRating !== null && averageRating !== undefined && (
            <div className="flex items-center gap-1">
              <StarRating rating={averageRating} size="sm" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BookGrid({ books, isLoading }: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <p className="text-base sm:text-lg text-muted-foreground">
          No books found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {books.map((book) => (
        <BookCard key={book.isbn} book={book} />
      ))}
    </div>
  );
}

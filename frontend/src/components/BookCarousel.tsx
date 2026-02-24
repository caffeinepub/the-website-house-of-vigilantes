import React, { useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Book } from '../backend';

interface BookCarouselProps {
  books: Book[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function BookCarousel({ books, loading = false, emptyMessage = 'No books available' }: BookCarouselProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleBookClick = (isbn: string) => {
    navigate({ to: '/book/$isbn', params: { isbn } });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] bg-background/80 backdrop-blur-sm"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] bg-background/80 backdrop-blur-sm"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book) => (
          <button
            key={book.isbn}
            onClick={() => handleBookClick(book.isbn)}
            className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group/card"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md transition-all group-hover/card:shadow-xl group-hover/card:scale-105">
              <img
                src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                }}
              />
            </div>
            <div className="mt-2 text-left">
              <h4 className="text-sm font-semibold line-clamp-2 group-hover/card:text-primary transition-colors">
                {book.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{book.author}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

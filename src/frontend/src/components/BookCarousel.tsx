import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book } from '../backend';

interface BookCarouselProps {
  books: Book[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function BookCarousel({ books, loading = false, emptyMessage = 'No books available' }: BookCarouselProps) {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('carousel-container');
    if (!container) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-muted rounded-xl mb-3" />
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      {books.length > 4 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
            onClick={() => handleScroll('left')}
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Carousel Container */}
      <div
        id="carousel-container"
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {books.map((book) => (
          <Card
            key={book.isbn}
            className="flex-shrink-0 w-[200px] cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-vangogh-yellow/40"
            onClick={() => navigate({ to: '/browse' })}
          >
            <CardContent className="p-0">
              <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {book.genre}
                  </Badge>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-bold text-sm line-clamp-2 min-h-[2.5rem]">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  by {book.author}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

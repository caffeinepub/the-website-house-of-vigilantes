import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import type { Book } from '../backend';

interface MoodCarouselProps {
  mood: string;
  books: Book[];
  emoji?: string;
  onBookClick?: (book: Book) => void;
}

const moodEmojis: Record<string, string> = {
  Happy: '😊',
  Melancholic: '😔',
  Adventurous: '🗺️',
  Calm: '🧘',
  Suspenseful: '😱',
  Inspiring: '✨',
};

export default function MoodCarousel({ mood, books, emoji, onBookClick }: MoodCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, [books]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      
      setTimeout(checkScrollButtons, 300);
    }
  };

  const displayEmoji = emoji || moodEmojis[mood] || '📚';

  return (
    <div className="relative py-8 px-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border shadow-lg">
      {/* Mood Header */}
      <div className="mb-6">
        <h3 className="text-3xl font-serif font-bold flex items-center gap-3 text-foreground">
          <span className="text-4xl">{displayEmoji}</span>
          <span>{mood}</span>
        </h3>
        <p className="text-muted-foreground mt-1 ml-14">
          {books.length} {books.length === 1 ? 'book' : 'books'} for this mood
        </p>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Navigation Arrows */}
        {books.length > 3 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm hover:bg-vangogh-gold/20 shadow-lg disabled:opacity-0 rounded-full h-12 w-12 border-2 border-vangogh-gold/30"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm hover:bg-vangogh-gold/20 shadow-lg disabled:opacity-0 rounded-full h-12 w-12 border-2 border-vangogh-gold/30"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Books Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          onScroll={checkScrollButtons}
        >
          {books.map((book) => (
            <Card
              key={book.isbn}
              className="flex-shrink-0 w-[240px] cursor-pointer hover:shadow-vangogh-glow transition-all duration-300 hover:-translate-y-2 bg-card border-2 border-transparent hover:border-vangogh-gold/40"
              onClick={() => onBookClick?.(book)}
            >
              <CardContent className="p-0">
                <div className="aspect-[2/3] relative overflow-hidden rounded-t-xl">
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs bg-card/90 backdrop-blur-sm">
                      {book.genre}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif font-bold text-base line-clamp-2 min-h-[3rem] text-foreground">
                    {book.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    by {book.author}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

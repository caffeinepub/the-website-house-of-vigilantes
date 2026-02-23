import { ReactNode, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface BookCarouselProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function BookCarousel({ 
  title, 
  children, 
  emptyMessage = 'No books available',
  isLoading = false 
}: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-starry-secondary">
          {title}
        </h2>
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[150px] md:min-w-[200px] space-y-2">
              <div className="aspect-[2/3] bg-muted rounded-2xl animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <ScrollArea className="w-full" ref={scrollRef}>
          <div className="flex gap-4 pb-4">
            {children}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {!isLoading && !children && (
        <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
      )}
    </div>
  );
}

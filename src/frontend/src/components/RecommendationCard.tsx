import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import type { Recommendation } from '../backend';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { book, reason } = recommendation;

  return (
    <Link
      to="/book/$isbn"
      params={{ isbn: book.isbn }}
      className="group block"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-starry-glow hover:scale-105 border-starry-secondary/30 relative">
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-starry-secondary/90 text-white shadow-md flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            For You
          </Badge>
        </div>
        <CardContent className="p-0">
          <div className="aspect-[2/3] overflow-hidden bg-muted relative">
            <img
              src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="p-3 md:p-4 space-y-2">
            <h3 className="book-title line-clamp-2 text-sm md:text-base group-hover:text-starry-secondary transition-colors">
              {book.title}
            </h3>
            <p className="book-author line-clamp-1 text-xs md:text-sm">{book.author}</p>
            <p className="text-xs text-muted-foreground italic line-clamp-2">
              {reason}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

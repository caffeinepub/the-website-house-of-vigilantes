import { Link } from '@tanstack/react-router';
import type { Book } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsCallerAdmin } from '../hooks/useQueries';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <Link
          key={book.isbn}
          to="/book/$isbn"
          params={{ isbn: book.isbn }}
          className="group"
        >
          <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-book-hover border-border/50">
            <CardContent className="p-0">
              <div className="aspect-[2/3] overflow-hidden bg-muted relative">
                <img
                  src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isAdmin && book.approvalStatus.__kind__ !== 'approved' && (
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant={book.approvalStatus.__kind__ === 'pending' ? 'secondary' : 'destructive'}
                      className="shadow-md"
                    >
                      {book.approvalStatus.__kind__ === 'pending' ? 'Pending' : 'Rejected'}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="book-title line-clamp-2 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="book-author line-clamp-1">{book.author}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

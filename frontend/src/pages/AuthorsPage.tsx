import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllBooks } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthorInfo {
  name: string;
  bookCount: number;
  books: string[];
}

export default function AuthorsPage() {
  const navigate = useNavigate();
  const { data: books, isLoading, error } = useGetAllBooks();

  // Extract unique authors with book counts
  const authors = useMemo(() => {
    if (!books) return [];

    const approvedBooks = books.filter(book => book.approvalStatus.__kind__ === 'approved');
    const authorMap = new Map<string, AuthorInfo>();

    approvedBooks.forEach(book => {
      const existing = authorMap.get(book.author);
      if (existing) {
        existing.bookCount++;
        existing.books.push(book.isbn);
      } else {
        authorMap.set(book.author, {
          name: book.author,
          bookCount: 1,
          books: [book.isbn],
        });
      }
    });

    return Array.from(authorMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [books]);

  const handleAuthorClick = (authorName: string) => {
    // Navigate to browse page - in future, this could filter by author
    navigate({ to: '/browse' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-vangogh-blue/20 via-vangogh-yellow/10 to-background border-b border-vangogh-yellow/20">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-vangogh-blue/10 rounded-full">
                <Users className="h-12 w-12 md:h-16 md:w-16 text-vangogh-blue" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-wide">
              Our Authors
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl mx-auto">
              Explore the talented writers who contribute to our collection. Each author brings unique perspectives and stories to our library.
            </p>
          </div>
        </div>
      </div>

      {/* Authors Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-3xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load authors. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="rounded-3xl">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto rounded-full" />
                  <Skeleton className="h-4 w-1/2 mx-auto rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-vangogh-blue/10 rounded-full">
                <Users className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                No Authors Yet
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                Our author directory is waiting for its first contributor. Be the first to share your work!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground text-center">
                {authors.length} {authors.length === 1 ? 'author' : 'authors'} in our collection
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {authors.map((author) => (
                <Card
                  key={author.name}
                  className="rounded-3xl border-2 border-vangogh-yellow/20 hover:border-vangogh-blue/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-vangogh-blue/20 group"
                  onClick={() => handleAuthorClick(author.name)}
                >
                  <CardContent className="p-6 space-y-4 text-center">
                    {/* Author Avatar Placeholder */}
                    <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-vangogh-blue/20 to-vangogh-yellow/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-12 w-12 text-vangogh-blue" />
                    </div>

                    {/* Author Name */}
                    <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-vangogh-blue transition-colors">
                      {author.name}
                    </h3>

                    {/* Book Count */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {author.bookCount} {author.bookCount === 1 ? 'book' : 'books'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

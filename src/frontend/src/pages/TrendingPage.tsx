import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetTrendingBooks, useGetAllBooks } from '../hooks/useQueries';
import { TrendingUp, Star, BookOpen, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
  { emoji: '🎭', label: 'Dramatic', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' },
  { emoji: '🔥', label: 'Exciting', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' },
  { emoji: '💭', label: 'Thought-provoking', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
  { emoji: '❤️', label: 'Romantic', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200' },
];

export default function TrendingPage() {
  const navigate = useNavigate();
  const { data: trendingBooks = [], isLoading: trendingLoading, error: trendingError } = useGetTrendingBooks();
  const { data: allBooks = [], isLoading: allBooksLoading } = useGetAllBooks();

  // Get top-rated books
  const topRatedBooks = useMemo(() => {
    if (!allBooks) return [];
    const approvedBooks = allBooks.filter(book => book.approvalStatus.__kind__ === 'approved');
    // For now, just return first 6 books as placeholder
    return approvedBooks.slice(0, 6);
  }, [allBooks]);

  // Group books by genre for trending sections
  const booksByGenre = useMemo(() => {
    if (!allBooks) return {};
    const approvedBooks = allBooks.filter(book => book.approvalStatus.__kind__ === 'approved');
    const genreMap: Record<string, typeof approvedBooks> = {};
    
    approvedBooks.forEach(book => {
      if (!genreMap[book.genre]) {
        genreMap[book.genre] = [];
      }
      genreMap[book.genre].push(book);
    });
    
    return genreMap;
  }, [allBooks]);

  const topGenres = Object.keys(booksByGenre).slice(0, 3);

  const isLoading = trendingLoading || allBooksLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-vangogh-yellow/20 via-vangogh-blue/10 to-background border-b border-vangogh-yellow/20">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-vangogh-yellow/20 rounded-full">
                <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-vangogh-blue" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-wide">
              Trending & Popular
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl mx-auto">
              Discover what's hot right now. Explore trending books, popular moods, and top-rated reads from our community.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 space-y-12 md:space-y-16">
        {/* Error State */}
        {trendingError && (
          <Alert variant="destructive" className="rounded-3xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load trending books. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Trending Books Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Flame className="h-8 w-8 text-vangogh-yellow" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Trending Now
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-3xl">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trendingBooks.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No trending books yet. Be the first to upload!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {trendingBooks.slice(0, 6).map((book, index) => (
                <Card
                  key={book.isbn}
                  className="rounded-3xl border-2 border-vangogh-yellow/20 hover:border-vangogh-blue/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-vangogh-blue/20 group relative"
                  onClick={() => navigate({ to: `/book/${book.isbn}` })}
                >
                  {/* Trending Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-vangogh-yellow text-vangogh-blue rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    #{index + 1}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden">
                      <img
                        src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-foreground line-clamp-2 group-hover:text-vangogh-blue transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Popular Moods Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-8 w-8 text-vangogh-gold" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Popular Moods
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {MOODS.map((mood) => (
              <Card
                key={mood.label}
                className="rounded-3xl border-2 border-vangogh-yellow/20 hover:border-vangogh-blue/40 transition-all duration-300 cursor-pointer hover:shadow-lg group"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl md:text-5xl">{mood.emoji}</div>
                  <Badge className={`${mood.color} border-0 text-sm font-medium`}>
                    {mood.label}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Top-Rated Books Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-8 w-8 text-vangogh-yellow fill-vangogh-yellow" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Top-Rated Books
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-3xl">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topRatedBooks.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Star className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No rated books yet. Start rating to see top picks!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {topRatedBooks.map((book) => (
                <Card
                  key={book.isbn}
                  className="rounded-3xl border-2 border-vangogh-blue/20 hover:border-vangogh-gold/40 transition-all duration-300 cursor-pointer hover:shadow-lg group"
                  onClick={() => navigate({ to: `/book/${book.isbn}` })}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden">
                      <img
                        src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-foreground line-clamp-2 group-hover:text-vangogh-blue transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-vangogh-yellow fill-vangogh-yellow" />
                        <span className="text-xs text-muted-foreground">5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Trending by Genre Sections */}
        {topGenres.map((genre) => (
          <section key={genre}>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-vangogh-blue" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Trending in {genre}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {booksByGenre[genre].slice(0, 6).map((book) => (
                <Card
                  key={book.isbn}
                  className="rounded-3xl border-2 border-vangogh-yellow/20 hover:border-vangogh-blue/40 transition-all duration-300 cursor-pointer hover:shadow-lg group"
                  onClick={() => navigate({ to: `/book/${book.isbn}` })}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden">
                      <img
                        src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-foreground line-clamp-2 group-hover:text-vangogh-blue transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

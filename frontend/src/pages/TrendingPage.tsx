import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetTrendingBooks, useGetBooksByGenre, useGetAllBooks } from '../hooks/useQueries';
import { TrendingUp, Star, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import BookGrid from '../components/BookGrid';
import type { Book } from '../backend';

export default function TrendingPage() {
  const navigate = useNavigate();
  const { data: trendingBooks = [], isLoading: trendingLoading } = useGetTrendingBooks();
  const { data: allBooks = [], isLoading: allBooksLoading } = useGetAllBooks();

  // Get books by genre for genre-based trending sections
  const { data: fictionBooks = [] } = useGetBooksByGenre('Fiction');
  const { data: sciFiBooks = [] } = useGetBooksByGenre('Science Fiction');
  const { data: mysteryBooks = [] } = useGetBooksByGenre('Mystery');

  // Calculate popular moods based on genre distribution
  const popularMoods = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];

    const genreCounts = allBooks
      .filter(book => book.approvalStatus.__kind__ === 'approved')
      .reduce((acc, book) => {
        acc[book.genre] = (acc[book.genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const moodMapping: Record<string, string> = {
      'Fiction': '😊 Happy',
      'Science Fiction': '🗺️ Adventurous',
      'Mystery': '😱 Suspenseful',
      'Non-Fiction': '🧘 Calm',
      'Biography': '✨ Inspiring',
      'Philosophy': '🤔 Reflective',
    };

    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([genre, count]) => ({
        mood: moodMapping[genre] || `📚 ${genre}`,
        count,
      }));
  }, [allBooks]);

  const handleBookClick = (book: Book) => {
    navigate({ to: '/book/$isbn', params: { isbn: book.isbn } });
  };

  const isLoading = trendingLoading || allBooksLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-vangogh-gold/20 via-vangogh-yellow/10 to-background border-b border-vangogh-gold/20">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-vangogh-gold/10 rounded-full">
                <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-vangogh-gold" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-wide">
              Trending & Popular
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl mx-auto">
              Discover what everyone is reading right now. The most loved and talked-about books in our community.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
        {/* Top Trending Books */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-vangogh-gold/20 to-vangogh-yellow/20 border-2 border-vangogh-gold/30">
              <Flame className="h-8 w-8 text-vangogh-gold" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Top Trending</h2>
              <p className="text-muted-foreground">Most popular books right now</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : trendingBooks.length > 0 ? (
            <div className="grid gap-4">
              {trendingBooks.slice(0, 10).map((book, index) => (
                <Card
                  key={book.isbn}
                  className="cursor-pointer hover:shadow-vangogh-glow transition-all duration-300 hover:border-vangogh-gold/40 bg-card border-2"
                  onClick={() => handleBookClick(book)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vangogh-gold/30 to-vangogh-yellow/30 flex items-center justify-center border-2 border-vangogh-gold/40 shadow-lg">
                          <span className="text-2xl font-bold text-vangogh-gold">
                            #{index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-24 h-32 object-cover rounded-xl shadow-md border-2 border-border"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                          }}
                        />
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-serif font-bold text-xl line-clamp-1 text-foreground">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {book.author}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {book.description}
                        </p>
                        <div className="flex items-center gap-3 pt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {book.genre}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-vangogh-gold text-vangogh-gold" />
                            <span className="font-semibold">{(5 - index * 0.2).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No trending books available yet
            </div>
          )}
        </section>

        {/* Popular Moods */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">Popular Moods</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularMoods.map((mood, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-vangogh-glow transition-all cursor-pointer border-2 hover:border-vangogh-gold/40"
              >
                <div className="text-4xl mb-2">{mood.mood.split(' ')[0]}</div>
                <div className="font-serif font-bold text-sm">{mood.mood.split(' ').slice(1).join(' ')}</div>
                <div className="text-xs text-muted-foreground mt-1">{mood.count} books</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Top Rated Books */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-vangogh-blue/20 to-vangogh-yellow/10 border-2 border-vangogh-blue/30">
              <Star className="h-8 w-8 text-vangogh-gold" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Top Rated</h2>
              <p className="text-muted-foreground">Highest rated books by readers</p>
            </div>
          </div>
          <BookGrid books={trendingBooks.slice(0, 8)} />
        </section>

        {/* Trending by Genre */}
        {fictionBooks.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold mb-6">Trending in Fiction</h2>
            <BookGrid books={fictionBooks.slice(0, 8)} />
          </section>
        )}

        {sciFiBooks.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold mb-6">Trending in Science Fiction</h2>
            <BookGrid books={sciFiBooks.slice(0, 8)} />
          </section>
        )}

        {mysteryBooks.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold mb-6">Trending in Mystery</h2>
            <BookGrid books={mysteryBooks.slice(0, 8)} />
          </section>
        )}
      </div>
    </div>
  );
}

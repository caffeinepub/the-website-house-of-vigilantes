import { useMemo } from 'react';
import { usePersonalizedRecommendations, useTrendingBooks, useGetAllBooks } from '../hooks/useQueries';
import { useMoodFilter } from '../hooks/useMoodFilter';
import BookCarousel from '../components/BookCarousel';
import RecommendationCard from '../components/RecommendationCard';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import MoodFilterChips from '../components/MoodFilterChips';
import type { Book } from '../backend';

export default function PersonalizedHomePage() {
  const { data: recommendations, isLoading: recsLoading } = usePersonalizedRecommendations();
  const { data: trendingBooks, isLoading: trendingLoading } = useTrendingBooks();
  const { data: allBooks, isLoading: booksLoading } = useGetAllBooks();
  const { selectedMoods, toggleMood, genresFromMoods } = useMoodFilter();

  // Filter books by mood-derived genres
  const moodBasedBooks = useMemo(() => {
    if (!allBooks || genresFromMoods.length === 0) return [];
    return allBooks
      .filter(book => 
        book.approvalStatus.__kind__ === 'approved' &&
        genresFromMoods.includes(book.genre)
      )
      .slice(0, 8);
  }, [allBooks, genresFromMoods]);

  // Recently added books
  const recentlyAddedBooks = useMemo(() => {
    if (!allBooks) return [];
    return [...allBooks]
      .filter(book => book.approvalStatus.__kind__ === 'approved')
      .sort((a, b) => Number(b.createdAt - a.createdAt))
      .slice(0, 8);
  }, [allBooks]);

  return (
    <div className="min-h-screen bg-starry-background">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
        {/* Welcome Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-starry-secondary">
            Your Personalized Library
          </h1>
          <p className="text-base md:text-lg text-starry-accent max-w-2xl mx-auto">
            Discover books tailored to your reading preferences and interests
          </p>
        </div>

        {/* Mood-Based Discovery Section */}
        <section className="space-y-4">
          <Card className="border-starry-accent/30 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
                How are you feeling today?
              </h3>
              <MoodFilterChips 
                selectedMoods={selectedMoods} 
                onToggleMood={toggleMood} 
              />
              {selectedMoods.length > 0 && moodBasedBooks.length > 0 && (
                <div className="mt-6">
                  <BookCarousel 
                    title="Books for Your Mood" 
                    isLoading={booksLoading}
                  >
                    {moodBasedBooks.map((book) => (
                      <BookCard key={book.isbn} book={book} />
                    ))}
                  </BookCarousel>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recommended for You */}
        {recommendations && recommendations.length > 0 && (
          <section>
            <BookCarousel 
              title="Recommended for You" 
              emptyMessage="Start reading and rating books to get personalized recommendations"
              isLoading={recsLoading}
            >
              {recommendations.map((rec) => (
                <div key={rec.book.isbn} className="min-w-[150px] md:min-w-[200px]">
                  <RecommendationCard recommendation={rec} />
                </div>
              ))}
            </BookCarousel>
          </section>
        )}

        {/* Trending Now */}
        <section>
          <BookCarousel 
            title="Trending Now" 
            emptyMessage="No trending books at the moment"
            isLoading={trendingLoading}
          >
            {trendingBooks?.slice(0, 8).map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </BookCarousel>
        </section>

        {/* Recently Added */}
        <section>
          <BookCarousel 
            title="Recently Added" 
            emptyMessage="No books have been added recently"
            isLoading={booksLoading}
          >
            {recentlyAddedBooks.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </BookCarousel>
        </section>
      </div>
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to="/book/$isbn"
      params={{ isbn: book.isbn }}
      className="group block min-w-[150px] md:min-w-[200px]"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-starry-glow hover:scale-105 border-border/50">
        <CardContent className="p-0">
          <div className="aspect-[2/3] overflow-hidden bg-muted">
            <img
              src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="p-3 space-y-1">
            <h3 className="book-title line-clamp-2 text-sm group-hover:text-starry-secondary transition-colors">
              {book.title}
            </h3>
            <p className="book-author line-clamp-1 text-xs">{book.author}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

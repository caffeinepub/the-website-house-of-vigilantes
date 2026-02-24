import React from 'react';
import { useGetPersonalizedRecommendations, useGetTrendingBooks, useGetBooksByGenre } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import BookCarousel from '../components/BookCarousel';
import { Skeleton } from '../components/ui/skeleton';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function PersonalizedHomePage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  const { data: recommendations, isLoading: recsLoading } = useGetPersonalizedRecommendations();
  const { data: trendingBooks, isLoading: trendingLoading } = useGetTrendingBooks();

  // Fetch books by different genres for mood-based sections
  const { data: fictionBooks } = useGetBooksByGenre('Fiction');
  const { data: mysteryBooks } = useGetBooksByGenre('Mystery');
  const { data: sciFiBooks } = useGetBooksByGenre('Science Fiction');
  const { data: fantasyBooks } = useGetBooksByGenre('Fantasy');
  const { data: romanceBooks } = useGetBooksByGenre('Romance');

  const moodSections = [
    { title: 'Happy Reads', books: fictionBooks || [], emoji: '😊' },
    { title: 'Exciting Adventures', books: sciFiBooks || [], emoji: '🚀' },
    { title: 'Mysterious Tales', books: mysteryBooks || [], emoji: '🔍' },
    { title: 'Romantic Stories', books: romanceBooks || [], emoji: '💕' },
    { title: 'Fantasy Worlds', books: fantasyBooks || [], emoji: '🧙' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {/* Welcome Section */}
          <section>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Continue your journey through knowledge and imagination
            </p>
          </section>

          {/* Personalized Recommendations */}
          <section>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                Recommended For You
              </h2>
            </div>
            {recsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <BookCarousel
                books={recommendations?.map((r) => r.book) || []}
                emptyMessage="No recommendations yet. Start exploring books to get personalized suggestions!"
              />
            )}
          </section>

          {/* Trending Books */}
          <section>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                Trending Now
              </h2>
            </div>
            {trendingLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <BookCarousel
                books={trendingBooks || []}
                emptyMessage="No trending books at the moment"
              />
            )}
          </section>

          {/* Mood-Based Sections */}
          {moodSections.map((section) => (
            <section key={section.title}>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <span className="text-2xl">{section.emoji}</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                  {section.title}
                </h2>
              </div>
              <BookCarousel
                books={section.books}
                emptyMessage={`No ${section.title.toLowerCase()} available yet`}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

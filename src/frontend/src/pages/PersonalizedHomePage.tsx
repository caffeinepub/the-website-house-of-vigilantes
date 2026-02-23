import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPersonalizedRecommendations, useGetTrendingBooks, useGetBooksWithProgress, useGetRecentlyViewedBooks } from '../hooks/useQueries';
import HeroSection from '../components/HeroSection';
import BookCarousel from '../components/BookCarousel';
import TrendingSection from '../components/TrendingSection';
import { mockBooksByMood } from '../utils/mockBookData';

export default function PersonalizedHomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: recommendations = [], isLoading: recsLoading } = useGetPersonalizedRecommendations();
  const { data: trendingBooks = [], isLoading: trendingLoading } = useGetTrendingBooks();
  const { data: continueReading = [], isLoading: progressLoading } = useGetBooksWithProgress();
  const { data: recentlyViewed = [], isLoading: recentLoading } = useGetRecentlyViewedBooks();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <HeroSection />

      <div className="container mx-auto px-4 py-12 space-y-16">
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">For You</h2>
            <BookCarousel
              books={recommendations.map(r => r.book)}
              loading={recsLoading}
            />
          </div>
        )}

        {continueReading.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">Continue Reading</h2>
            <BookCarousel
              books={continueReading}
              loading={progressLoading}
            />
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">Recently Viewed</h2>
            <BookCarousel
              books={recentlyViewed}
              loading={recentLoading}
            />
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">😊 Happy</h2>
          <BookCarousel
            books={mockBooksByMood.Happy}
            loading={false}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">😢 Melancholic</h2>
          <BookCarousel
            books={mockBooksByMood.Melancholic}
            loading={false}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">🗺️ Adventurous</h2>
          <BookCarousel
            books={mockBooksByMood.Adventurous}
            loading={false}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">🧘 Calm</h2>
          <BookCarousel
            books={mockBooksByMood.Calm}
            loading={false}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">✨ Inspiring</h2>
          <BookCarousel
            books={mockBooksByMood.Inspiring}
            loading={false}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">🔍 Suspenseful</h2>
          <BookCarousel
            books={mockBooksByMood.Suspenseful}
            loading={false}
          />
        </div>

        {!trendingLoading && trendingBooks.length > 0 && (
          <TrendingSection books={trendingBooks} />
        )}
      </div>
    </div>
  );
}

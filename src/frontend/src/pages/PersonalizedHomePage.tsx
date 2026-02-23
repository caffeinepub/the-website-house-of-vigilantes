import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetPersonalizedRecommendations, useGetTrendingBooks, useGetAllBooks } from '../hooks/useQueries';
import HeroSection from '../components/HeroSection';
import MoodCarousel from '../components/MoodCarousel';
import TrendingSection from '../components/TrendingSection';
import { mockBooksByMood } from '../utils/mockBookData';

export default function PersonalizedHomePage() {
  const navigate = useNavigate();
  const { data: recommendations = [] } = useGetPersonalizedRecommendations();
  const { data: trendingBooks = [] } = useGetTrendingBooks();
  const { data: allBooks = [] } = useGetAllBooks();

  const handleSearch = (query: string) => {
    // Navigate to browse page with search query
    navigate({ to: '/browse', search: { q: query } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      {/* Hero Section with Search */}
      <HeroSection onSearch={handleSearch} />

      {/* Mood-Based Carousels */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        <MoodCarousel
          mood="Happy"
          emoji="😊"
          books={mockBooksByMood.Happy}
        />
        
        <MoodCarousel
          mood="Melancholic"
          emoji="😔"
          books={mockBooksByMood.Melancholic}
        />
        
        <MoodCarousel
          mood="Adventurous"
          emoji="🗺️"
          books={mockBooksByMood.Adventurous}
        />
        
        <MoodCarousel
          mood="Calm"
          emoji="🧘"
          books={mockBooksByMood.Calm}
        />
        
        <MoodCarousel
          mood="Inspiring"
          emoji="✨"
          books={mockBooksByMood.Inspiring}
        />
        
        <MoodCarousel
          mood="Suspenseful"
          emoji="😰"
          books={mockBooksByMood.Suspenseful}
        />
      </div>

      {/* Trending Section */}
      <div className="container mx-auto px-4 pb-12">
        <TrendingSection books={trendingBooks.slice(0, 10)} />
      </div>
    </div>
  );
}

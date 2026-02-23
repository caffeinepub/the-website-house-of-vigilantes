import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllBooks, useTrendingBooks, usePersonalizedRecommendations } from '../hooks/useQueries';
import { useMoodFilter } from '../hooks/useMoodFilter';
import MoodFilterChips from '../components/MoodFilterChips';
import BookGrid from '../components/BookGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Heart, TrendingUp, Sparkles, Upload, Library, AlertCircle } from 'lucide-react';

type ExpandedSection = 'mood' | 'trending' | null;

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  
  const { data: allBooks, isLoading: booksLoading, error: booksError } = useGetAllBooks();
  const { data: trendingBooks, isLoading: trendingLoading } = useTrendingBooks();
  const { data: recommendations, isLoading: recommendationsLoading } = usePersonalizedRecommendations();
  
  const { selectedMoods, toggleMood, clearMoods, genresFromMoods } = useMoodFilter();

  const isAuthenticated = !!identity;

  // Filter books by mood
  const moodFilteredBooks = allBooks?.filter(book => 
    genresFromMoods.length === 0 || genresFromMoods.includes(book.genre)
  ) || [];

  const handleToggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleBrowseBooks = () => {
    navigate({ to: '/browse' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Van Gogh Background with CSS Effects */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/generated/vangogh-hero.dim_1920x1080.png"
          alt="Van Gogh inspired background"
          className="w-full h-full object-cover"
        />
        {/* Swirling gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-vangogh-yellow/20 via-transparent to-vangogh-blue/30 animate-subtle-swirl" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-vangogh-green/10 to-transparent" />
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section with Title */}
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 text-center">
          <h1 className="vangogh-title text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 md:mb-6">
            THE HOUSE OF VIGILANTES
          </h1>
          <p className="vangogh-subtitle text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 md:mb-12">
            A digital sanctuary where ideas are preserved, knowledge is shared, and readers are honored
          </p>
        </div>

        {/* Three Main Options - Prominent Center Panel */}
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="vangogh-card border-4 border-vangogh-yellow/60 shadow-vangogh-glow">
              <CardContent className="p-6 md:p-8 space-y-4">
                {/* Browse Books - Navigate */}
                <button
                  onClick={handleBrowseBooks}
                  className="w-full vangogh-option-button group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="vangogh-icon-wrapper">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold">Browse Books</h2>
                        <p className="text-sm md:text-base opacity-90">Explore our complete collection</p>
                      </div>
                    </div>
                    <div className="vangogh-arrow">→</div>
                  </div>
                </button>

                {/* Mood-Based Recommendations - Expand */}
                <button
                  onClick={() => handleToggleSection('mood')}
                  className="w-full vangogh-option-button group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="vangogh-icon-wrapper">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold">Mood-Based Recommendations</h2>
                        <p className="text-sm md:text-base opacity-90">Discover books that match your mood</p>
                      </div>
                    </div>
                    <div className="vangogh-arrow">
                      {expandedSection === 'mood' ? '↑' : '↓'}
                    </div>
                  </div>
                </button>

                {/* Trending & Popular - Expand */}
                <button
                  onClick={() => handleToggleSection('trending')}
                  className="w-full vangogh-option-button group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="vangogh-icon-wrapper">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold">Trending & Popular</h2>
                        <p className="text-sm md:text-base opacity-90">See what others are reading</p>
                      </div>
                    </div>
                    <div className="vangogh-arrow">
                      {expandedSection === 'trending' ? '↑' : '↓'}
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Menu */}
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="vangogh-secondary-card border-2 border-vangogh-blue/40">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Link to="/browse" className="vangogh-secondary-link">
                    <Library className="h-6 w-6 mb-2" />
                    <span className="text-sm md:text-base font-medium">Collection</span>
                  </Link>
                  <Link to="/upload" className="vangogh-secondary-link">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm md:text-base font-medium">Upload Book</span>
                  </Link>
                  <Link to="/my-books" className="vangogh-secondary-link">
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span className="text-sm md:text-base font-medium">My Books</span>
                  </Link>
                  <Link to="/favorites" className="vangogh-secondary-link">
                    <Heart className="h-6 w-6 mb-2" />
                    <span className="text-sm md:text-base font-medium">Favorites</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expanded Sections */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Mood-Based Recommendations Expanded */}
            {expandedSection === 'mood' && (
              <Card className="vangogh-expanded-section animate-expand-in">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-8 w-8 text-vangogh-yellow" />
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">
                      Select Your Mood
                    </h3>
                  </div>
                  
                  <div className="mb-6">
                    <MoodFilterChips 
                      selectedMoods={selectedMoods} 
                      onToggleMood={toggleMood} 
                    />
                  </div>

                  {selectedMoods.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-serif font-semibold text-white">
                          Books for Your Mood ({moodFilteredBooks.length})
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearMoods}
                          className="vangogh-clear-button"
                        >
                          Clear Moods
                        </Button>
                      </div>
                      
                      {booksLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
                          ))}
                        </div>
                      ) : booksError ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Failed to load books</AlertDescription>
                        </Alert>
                      ) : moodFilteredBooks.length > 0 ? (
                        <BookGrid books={moodFilteredBooks.slice(0, 12)} />
                      ) : (
                        <p className="text-center text-white/80 py-8">
                          No books found for the selected moods
                        </p>
                      )}
                    </div>
                  )}

                  {isAuthenticated && selectedMoods.length === 0 && (
                    <div className="mt-6">
                      <h4 className="text-xl font-serif font-semibold text-white mb-4">
                        Personalized for You
                      </h4>
                      {recommendationsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
                          ))}
                        </div>
                      ) : recommendations && recommendations.length > 0 ? (
                        <BookGrid books={recommendations.map(r => r.book)} />
                      ) : (
                        <p className="text-center text-white/80 py-8">
                          No personalized recommendations available yet
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trending & Popular Expanded */}
            {expandedSection === 'trending' && (
              <Card className="vangogh-expanded-section animate-expand-in">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="h-8 w-8 text-vangogh-yellow" />
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">
                      Trending & Popular Books
                    </h3>
                  </div>
                  
                  {trendingLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
                      ))}
                    </div>
                  ) : trendingBooks && trendingBooks.length > 0 ? (
                    <BookGrid books={trendingBooks.slice(0, 12)} />
                  ) : (
                    <p className="text-center text-white/80 py-8">
                      No trending books available at the moment
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Decorative swirling elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-vangogh-yellow/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-vangogh-blue/20 rounded-full blur-3xl animate-pulse-slow-delay pointer-events-none" />
        <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-vangogh-green/15 rounded-full blur-2xl animate-float pointer-events-none" />
      </div>
    </div>
  );
}

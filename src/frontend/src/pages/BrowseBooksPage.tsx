import { useState, useMemo } from 'react';
import { useGetAllBooks } from '../hooks/useQueries';
import { useMoodFilter } from '../hooks/useMoodFilter';
import BookGrid from '../components/BookGrid';
import MoodFilterChips from '../components/MoodFilterChips';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, Search, Filter, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function BrowseBooksPage() {
  const { data: books, isLoading, error } = useGetAllBooks();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [authorSearch, setAuthorSearch] = useState<string>('');
  const { selectedMoods, toggleMood, clearMoods, genresFromMoods } = useMoodFilter();

  // Filter to show only approved books
  const approvedBooks = books?.filter(book => book.approvalStatus.__kind__ === 'approved') || [];

  // Extract unique genres from approved books
  const uniqueGenres = useMemo(() => {
    const genres = approvedBooks.map(book => book.genre);
    return Array.from(new Set(genres)).sort();
  }, [approvedBooks]);

  // Apply filters
  const filteredBooks = useMemo(() => {
    let result = approvedBooks;

    // Filter by genre
    if (selectedGenre) {
      result = result.filter(book => book.genre === selectedGenre);
    }

    // Filter by author (case-insensitive partial match)
    if (authorSearch.trim()) {
      const searchLower = authorSearch.toLowerCase();
      result = result.filter(book => 
        book.author.toLowerCase().includes(searchLower)
      );
    }

    // Filter by mood-derived genres
    if (genresFromMoods.length > 0) {
      result = result.filter(book => genresFromMoods.includes(book.genre));
    }

    return result;
  }, [approvedBooks, selectedGenre, authorSearch, genresFromMoods]);

  const hasActiveFilters = selectedGenre || authorSearch.trim() || selectedMoods.length > 0;

  const handleClearAllFilters = () => {
    setSelectedGenre('');
    setAuthorSearch('');
    clearMoods();
  };

  return (
    <div className="min-h-screen bg-starry-background">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-starry-primary/20 via-starry-background to-starry-background border-b border-starry-accent/30">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-starry-secondary/10 rounded-full">
                <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-starry-secondary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-starry-secondary tracking-wide">
              Browse Our Library
            </h1>
            <p className="text-base md:text-lg text-starry-accent font-serif leading-relaxed max-w-2xl mx-auto">
              Explore our complete collection of approved books. Each title has been carefully reviewed to ensure quality and meaningful content.
            </p>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-3xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load books. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
                <Skeleton className="h-5 md:h-6 w-3/4 rounded-full" />
                <Skeleton className="h-3 md:h-4 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : approvedBooks.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-starry-primary/10 rounded-full">
                <BookOpen className="h-16 w-16 text-starry-accent/50" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-starry-secondary">
                No Books Yet
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                Our library is waiting for its first book. Be the first to contribute and share knowledge with the community!
              </p>
            </div>
            <Link to="/upload">
              <Button 
                size="lg" 
                className="bg-starry-secondary hover:bg-starry-secondary/90 text-white rounded-full px-8 py-6 text-base font-medium shadow-starry-glow transition-all duration-300"
              >
                Upload Your First Book
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Controls Section */}
            <div className="mb-8 space-y-6">
              {/* Mood Filter */}
              <Card className="border-starry-accent/30 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-serif font-semibold text-foreground">
                      Browse by Mood
                    </h3>
                    {selectedMoods.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearMoods}
                        className="text-xs"
                      >
                        Clear Moods
                      </Button>
                    )}
                  </div>
                  <MoodFilterChips 
                    selectedMoods={selectedMoods} 
                    onToggleMood={toggleMood} 
                  />
                  {selectedMoods.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Filtering by {selectedMoods.length} {selectedMoods.length === 1 ? 'mood' : 'moods'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Traditional Filters */}
              <Card className="border-starry-accent/30 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-starry-secondary" />
                    <h3 className="text-lg font-serif font-semibold text-foreground">
                      Filter Books
                    </h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Genre Filter */}
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="genre-filter" className="text-sm font-medium text-foreground">
                        Genre
                      </Label>
                      <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                        <SelectTrigger 
                          id="genre-filter"
                          className="w-full bg-background border-border rounded-2xl focus:ring-2 focus:ring-starry-secondary/50 transition-all"
                        >
                          <SelectValue placeholder="All Genres" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="" className="rounded-xl">
                            All Genres
                          </SelectItem>
                          {uniqueGenres.map(genre => (
                            <SelectItem key={genre} value={genre} className="rounded-xl">
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Author Search */}
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="author-search" className="text-sm font-medium text-foreground">
                        Search by Author
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="author-search"
                          type="text"
                          placeholder="Enter author name..."
                          value={authorSearch}
                          onChange={(e) => setAuthorSearch(e.target.value)}
                          className="pl-10 bg-background border-border rounded-2xl focus:ring-2 focus:ring-starry-secondary/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear All Filters Button */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="rounded-full border-starry-accent/30 hover:bg-starry-accent/10 transition-all"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Book Count and Results */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm md:text-base text-muted-foreground">
                {hasActiveFilters ? (
                  <>
                    Found <span className="font-semibold text-starry-secondary">{filteredBooks.length}</span> {filteredBooks.length === 1 ? 'book' : 'books'}
                  </>
                ) : (
                  <>
                    Showing <span className="font-semibold text-starry-secondary">{filteredBooks.length}</span> {filteredBooks.length === 1 ? 'book' : 'books'}
                  </>
                )}
              </p>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="flex justify-center">
                  <div className="p-6 bg-starry-primary/10 rounded-full">
                    <Search className="h-16 w-16 text-starry-accent/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-starry-secondary">
                    No Books Found
                  </h3>
                  <p className="text-muted-foreground text-base max-w-md mx-auto">
                    No books match your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              </div>
            ) : (
              <BookGrid books={filteredBooks} />
            )}
          </>
        )}
      </section>
    </div>
  );
}

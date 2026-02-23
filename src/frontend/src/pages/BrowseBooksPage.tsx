import { useMemo, useState } from 'react';
import { useGetAllBooks } from '../hooks/useQueries';
import { useMoodFilter } from '../hooks/useMoodFilter';
import BookGrid from '../components/BookGrid';
import MoodFilterChips from '../components/MoodFilterChips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Filter, X, AlertCircle } from 'lucide-react';

export default function BrowseBooksPage() {
  const { data: books, isLoading, error } = useGetAllBooks();
  const { selectedMoods, toggleMood, clearMoods, genresFromMoods } = useMoodFilter();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');

  // Extract unique genres and authors from approved books
  const { genres, authors } = useMemo(() => {
    if (!books) return { genres: [], authors: [] };

    const approvedBooks = books.filter(book => book.approvalStatus.__kind__ === 'approved');
    const genreSet = new Set(approvedBooks.map(book => book.genre));
    const authorSet = new Set(approvedBooks.map(book => book.author));

    return {
      genres: Array.from(genreSet).sort(),
      authors: Array.from(authorSet).sort(),
    };
  }, [books]);

  // Filter books by all criteria: mood-derived genres, selected genre, and selected author
  const filteredBooks = useMemo(() => {
    if (!books) return [];

    let filtered = books.filter(book => book.approvalStatus.__kind__ === 'approved');

    // Filter by mood-derived genres
    if (genresFromMoods.length > 0) {
      filtered = filtered.filter(book => genresFromMoods.includes(book.genre));
    }

    // Filter by selected genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Filter by selected author
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(book => book.author === selectedAuthor);
    }

    return filtered;
  }, [books, genresFromMoods, selectedGenre, selectedAuthor]);

  const clearAllFilters = () => {
    clearMoods();
    setSelectedGenre('all');
    setSelectedAuthor('all');
  };

  const hasActiveFilters = selectedMoods.length > 0 || selectedGenre !== 'all' || selectedAuthor !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-vangogh-blue/20 via-vangogh-yellow/10 to-background border-b border-vangogh-yellow/20">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-vangogh-blue/10 rounded-full">
                <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-vangogh-blue" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-wide">
              Browse Our Collection
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl mx-auto">
              Explore our curated library of books across all genres. Filter by mood, genre, or author to find your next great read.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Books Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* Mood Filter Section */}
        <Card className="mb-8 border-2 border-vangogh-blue/30 rounded-3xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodFilterChips selectedMoods={selectedMoods} onToggleMood={toggleMood} />
          </CardContent>
        </Card>

        {/* Traditional Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-full">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-full">
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="rounded-full w-full md:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-3xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load books. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
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
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-vangogh-blue/10 rounded-full">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                No Books Found
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No books are available at the moment. Check back soon!'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="rounded-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm md:text-base text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredBooks.length}</span> {filteredBooks.length === 1 ? 'book' : 'books'}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
            <BookGrid books={filteredBooks} />
          </>
        )}
      </section>
    </div>
  );
}

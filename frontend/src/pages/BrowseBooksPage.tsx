import React, { useState, useMemo } from 'react';
import { useGetAllBooks } from '../hooks/useQueries';
import BookGrid from '../components/BookGrid';
import HeroSection from '../components/HeroSection';
import MoodFilterChips from '../components/MoodFilterChips';
import { useMoodFilter } from '../hooks/useMoodFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';

export default function BrowseBooksPage() {
  const { data: books, isLoading } = useGetAllBooks();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const { selectedMoods, genresFromMoods } = useMoodFilter();

  const genres = useMemo(() => {
    if (!books) return [];
    const uniqueGenres = Array.from(new Set(books.map((b) => b.genre)));
    return uniqueGenres.sort();
  }, [books]);

  const authors = useMemo(() => {
    if (!books) return [];
    const uniqueAuthors = Array.from(new Set(books.map((b) => b.author)));
    return uniqueAuthors.sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter((book) => {
      const genreMatch = selectedGenre === 'all' || book.genre === selectedGenre;
      const authorMatch = selectedAuthor === 'all' || book.author === selectedAuthor;
      const moodMatch = selectedMoods.length === 0 || genresFromMoods.includes(book.genre);
      return genreMatch && authorMatch && moodMatch;
    });
  }, [books, selectedGenre, selectedAuthor, selectedMoods, genresFromMoods]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Filters Section */}
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          {/* Mood Filters */}
          <div>
            <Label className="text-base sm:text-lg font-semibold mb-3 block">
              Filter by Mood
            </Label>
            <MoodFilterChips />
          </div>

          {/* Genre and Author Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre-select" className="text-sm font-medium">
                Genre
              </Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger id="genre-select" className="w-full min-h-[44px]">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-select" className="text-sm font-medium">
                Author
              </Label>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger id="author-select" className="w-full min-h-[44px]">
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <BookGrid books={filteredBooks} isLoading={isLoading} />
      </div>
    </div>
  );
}

import React from 'react';
import { useGetBooksByGenre } from '../hooks/useQueries';
import BookCarousel from './BookCarousel';

interface MoodCarouselProps {
  mood: string;
}

// Map moods to genres (simplified mapping)
const moodToGenreMap: Record<string, string> = {
  'Happy': 'Fiction',
  'Exciting': 'Science Fiction',
  'Inspiring': 'Biography',
  'Romantic': 'Romance',
  'Suspenseful': 'Mystery',
  'Thought-provoking': 'Philosophy',
  'Relaxing': 'Poetry',
  'Dark': 'Thriller',
  'Uplifting': 'Self-Help',
};

export default function MoodCarousel({ mood }: MoodCarouselProps) {
  const genre = moodToGenreMap[mood] || 'Fiction';
  const { data: books, isLoading } = useGetBooksByGenre(genre);

  return (
    <BookCarousel
      books={books || []}
      loading={isLoading}
      emptyMessage={`No ${mood.toLowerCase()} books available yet`}
    />
  );
}

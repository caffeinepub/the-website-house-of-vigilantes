export type Mood = 
  | 'Happy'
  | 'Exciting'
  | 'Inspiring'
  | 'Romantic'
  | 'Suspenseful'
  | 'Thought-provoking'
  | 'Relaxing'
  | 'Dark'
  | 'Uplifting';

export const MOOD_TO_GENRES: Record<Mood, string[]> = {
  Happy: ['Comedy', 'Romance', 'Young Adult', 'Contemporary'],
  Exciting: ['Adventure', 'Action', 'Thriller', 'Science Fiction'],
  Inspiring: ['Biography', 'Self-Help', 'Memoir', 'Non-Fiction'],
  Romantic: ['Romance', 'Contemporary', 'Historical Fiction'],
  Suspenseful: ['Thriller', 'Mystery', 'Horror', 'Crime'],
  'Thought-provoking': ['Philosophy', 'Literary Fiction', 'Non-Fiction', 'Science'],
  Relaxing: ['Poetry', 'Nature', 'Travel', 'Cookbook'],
  Dark: ['Horror', 'Thriller', 'Mystery', 'Gothic'],
  Uplifting: ['Inspirational', 'Self-Help', 'Biography', 'Contemporary'],
};

export function getAllMoods(): Mood[] {
  return Object.keys(MOOD_TO_GENRES) as Mood[];
}

export function getGenresForMoods(moods: Mood[]): string[] {
  if (moods.length === 0) return [];
  
  const genreSet = new Set<string>();
  moods.forEach(mood => {
    MOOD_TO_GENRES[mood]?.forEach(genre => genreSet.add(genre));
  });
  
  return Array.from(genreSet);
}

export function getMoodEmoji(mood: Mood): string {
  const emojiMap: Record<Mood, string> = {
    Happy: '😊',
    Exciting: '🎢',
    Inspiring: '✨',
    Romantic: '💕',
    Suspenseful: '😰',
    'Thought-provoking': '🤔',
    Relaxing: '🧘',
    Dark: '🌑',
    Uplifting: '🌟',
  };
  return emojiMap[mood] || '📚';
}

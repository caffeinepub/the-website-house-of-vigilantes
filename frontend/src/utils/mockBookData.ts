/**
 * DEPRECATED: This file contains mock data for development and testing purposes only.
 * 
 * All production components should use real backend queries via useQueries hooks.
 * This file is retained only for reference and should not be imported in production code.
 * 
 * Use the following hooks instead:
 * - useGetAllBooks() - Get all approved books
 * - useGetBooksByGenre(genre) - Get books by genre
 * - useGetTrendingBooks() - Get trending books
 * - useGetPersonalizedRecommendations() - Get personalized recommendations
 */

import type { Book } from '../backend';

// Helper function to create mock Principal
const mockPrincipal = (id: string) => ({
  toText: () => id,
  toString: () => id,
} as any);

// Mock books organized by mood categories with generated cover images
export const mockBooksByMood = {
  Happy: [
    {
      title: 'Sunflower Meadows',
      author: 'Iris Bloom',
      coverImageUrl: '/assets/generated/happy-book-1.dim_400x600.png',
      description: 'A heartwarming tale of friendship and golden summer days filled with laughter and joy.',
      publicationYear: BigInt(2024),
      isbn: 'happy-001',
      uploaderId: mockPrincipal('mock-uploader-1'),
      approvalStatus: { __kind__: 'approved' as const, approved: null },
      genre: 'Fiction',
      editCount: BigInt(0),
      createdAt: BigInt(Date.now() * 1000000),
      pageCount: BigInt(280),
      pdfFileUrl: '',
    },
  ] as Book[],
  Melancholic: [] as Book[],
  Adventurous: [] as Book[],
  Calm: [] as Book[],
  Inspiring: [] as Book[],
  Suspenseful: [] as Book[],
};

export const mockTrendingBooks: Book[] = [];

export const mockAnalyticsData = {
  totalBooks: 0,
  totalUsers: 0,
  activeUsers: 0,
};

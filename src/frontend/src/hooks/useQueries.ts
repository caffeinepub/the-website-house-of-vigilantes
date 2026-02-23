import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Book, UserProfile, Rating, Recommendation } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: isFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Book Queries
export function useGetAllBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyBooks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Book[]>({
    queryKey: ['myBooks', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const allBooks = await actor.getAllBooks();
      const userPrincipal = identity.getPrincipal().toString();
      return allBooks.filter(book => book.uploaderId.toString() === userPrincipal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetBook(isbn: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Book | null>({
    queryKey: ['book', isbn],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBook(isbn);
    },
    enabled: !!actor && !isFetching && !!isbn,
  });
}

export function useGetBooksByGenre(genre: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books', 'genre', genre],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooksByGenre(genre);
    },
    enabled: !!actor && !isFetching && !!genre,
  });
}

export function useGetBooksByAuthor(author: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books', 'author', author],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooksByAuthor(author);
    },
    enabled: !!actor && !isFetching && !!author,
  });
}

export function useGetTrendingBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books', 'trending'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

// Book Mutations
export function useSubmitBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (book: Book) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitBookForApproval(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isbn, book }: { isbn: string; book: Book }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(isbn, book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isbn: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBook(isbn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    },
  });
}

// Admin Book Queries
export function useGetPendingSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['submissions', 'pending'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveBookSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      isbn,
      isApproved,
      rejectionReason,
    }: {
      isbn: string;
      isApproved: boolean;
      rejectionReason?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBookSubmission(isbn, isApproved, rejectionReason || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

// Bookmark Queries
export function useBookmarkedBooks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Book[]>({
    queryKey: ['bookmarks', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getBookmarkedBooks(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsBookBookmarked(isbn: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['bookmark', isbn, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isBookBookmarked(identity.getPrincipal(), isbn);
    },
    enabled: !!actor && !isFetching && !!identity && !!isbn,
  });
}

export function useToggleBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (isbn: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleBookmark(isbn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark'] });
    },
  });
}

// Rating Queries
export function useGetBookAverageRating(isbn: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['rating', 'average', isbn],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBookAverageRating(isbn);
    },
    enabled: !!actor && !isFetching && !!isbn,
  });
}

export function useAddRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookIsbn, stars }: { bookIsbn: string; stars: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addRating(bookIsbn, BigInt(stars));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rating', 'average', variables.bookIsbn] });
    },
  });
}

// Reading Progress Queries
export function useGetUserBookProgress(isbn: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['progress', isbn],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserBookProgress(isbn);
    },
    enabled: !!actor && !isFetching && !!isbn,
  });
}

export function useUpdateReadingProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookIsbn, pagesRead }: { bookIsbn: string; pagesRead: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateReadingProgress(bookIsbn, pagesRead);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress', variables.bookIsbn] });
    },
  });
}

// Personalized Recommendations
export function useGetPersonalizedRecommendations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Recommendation[]>({
    queryKey: ['recommendations', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getPersonalizedRecommendations(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Books with Progress
export function useGetBooksWithProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Book[]>({
    queryKey: ['booksWithProgress', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const allProgress = await actor.getAllUserProgress(identity.getPrincipal());
      const booksWithProgress = await Promise.all(
        allProgress.map(async ([_, progress]) => {
          const book = await actor.getBook(progress.bookIsbn);
          return book;
        })
      );
      return booksWithProgress.filter((book): book is Book => book !== null);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Recently Viewed Books
const RECENTLY_VIEWED_KEY = 'recentlyViewedBooks';

export function useGetRecentlyViewedBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['recentlyViewed'],
    queryFn: async () => {
      if (!actor) return [];
      const recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]') as string[];
      const books = await Promise.all(
        recentlyViewed.slice(0, 10).map(async (isbn) => {
          try {
            return await actor.getBook(isbn);
          } catch {
            return null;
          }
        })
      );
      return books.filter((book): book is Book => book !== null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrackBookView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isbn: string) => {
      const recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]') as string[];
      const filtered = recentlyViewed.filter((id) => id !== isbn);
      const updated = [isbn, ...filtered].slice(0, 20);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentlyViewed'] });
    },
  });
}

// Request More Edits
export function useRequestMoreEdits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isbn, message }: { isbn: string; message?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestMoreEdits(isbn, message || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    },
  });
}

// Delete Account
export function useDeleteAccount() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (targetUser: Principal | null) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount(targetUser);
    },
  });
}

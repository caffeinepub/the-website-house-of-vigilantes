import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Book, UserProfile, BookSubmission, ReadingProgress, Rating, Recommendation } from '../backend';

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

export function useGetMyBooks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Book[]>({
    queryKey: ['myBooks', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const allBooks = await actor.getAllBooks();
      const myPrincipal = identity.getPrincipal().toString();
      return allBooks.filter(book => book.uploaderId.toString() === myPrincipal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

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

// Alias for backward compatibility
export const useSubmitBookForApproval = useSubmitBook;

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isbn, book }: { isbn: string; book: Book }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(isbn, book);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.isbn] });
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

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<BookSubmission[]>({
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
    mutationFn: async ({ isbn, isApproved, rejectionReason }: { isbn: string; isApproved: boolean; rejectionReason: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBookSubmission(isbn, isApproved, rejectionReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
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

export function useGetUserBookProgress(bookIsbn: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ReadingProgress | null>({
    queryKey: ['progress', bookIsbn, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getUserBookProgress(bookIsbn);
    },
    enabled: !!actor && !isFetching && !!identity && !!bookIsbn,
  });
}

export function useRequestMoreEdits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isbn, message }: { isbn: string; message: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestMoreEdits(isbn, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    },
  });
}

// Bookmarking hooks
export function useToggleBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (bookIsbn: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleBookmark(bookIsbn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['bookmarkStatus'] });
    },
  });
}

export function useIsBookBookmarked(bookIsbn: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['bookmarkStatus', bookIsbn, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isBookBookmarked(identity.getPrincipal(), bookIsbn);
    },
    enabled: !!actor && !isFetching && !!identity && !!bookIsbn,
  });
}

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

// Rating hooks
export function useAddRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookIsbn, stars }: { bookIsbn: string; stars: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addRating(bookIsbn, BigInt(stars));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.bookIsbn] });
      queryClient.invalidateQueries({ queryKey: ['averageRating', variables.bookIsbn] });
      queryClient.invalidateQueries({ queryKey: ['trending'] });
    },
  });
}

export function useBookRatings(bookIsbn: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Rating[]>({
    queryKey: ['ratings', bookIsbn],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookRatings(bookIsbn);
    },
    enabled: !!actor && !isFetching && !!bookIsbn,
  });
}

export function useBookAverageRating(bookIsbn: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['averageRating', bookIsbn],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBookAverageRating(bookIsbn);
    },
    enabled: !!actor && !isFetching && !!bookIsbn,
  });
}

// Trending books
export function useTrendingBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['trending'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingBooks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Personalized recommendations
export function usePersonalizedRecommendations() {
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

export function useSetPreferredGenres() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (genres: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPreferredGenres(genres);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

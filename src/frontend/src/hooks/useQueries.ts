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

export function useGetBooksByAuthor(author: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['booksByAuthor', author],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooksByAuthor(author);
    },
    enabled: !!actor && !isFetching && !!author,
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
      queryClient.invalidateQueries({ queryKey: ['booksByAuthor'] });
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
      queryClient.invalidateQueries({ queryKey: ['booksByAuthor'] });
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

export function useDeleteAccount() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount(null);
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
      queryClient.invalidateQueries({ queryKey: ['booksWithProgress'] });
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

export function useGetAllUserProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<[string, ReadingProgress][]>({
    queryKey: ['allProgress', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllUserProgress(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
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

export function useGetBookAverageRating(bookIsbn: string) {
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

export function useGetTrendingBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['trending'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

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

// Books with progress for "Continue Reading"
export function useGetBooksWithProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Book[]>({
    queryKey: ['booksWithProgress', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const progressData = await actor.getAllUserProgress(identity.getPrincipal());
      const booksWithProgress: Book[] = [];
      
      for (const [_, progress] of progressData) {
        const book = await actor.getBook(progress.bookIsbn);
        if (book && progress.pagesRead < book.pageCount) {
          booksWithProgress.push(book);
        }
      }
      
      return booksWithProgress;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Recently viewed books (stored in localStorage for now)
export function useGetRecentlyViewedBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['recentlyViewed'],
    queryFn: async () => {
      if (!actor) return [];
      const viewedIsbnString = localStorage.getItem('recentlyViewedBooks');
      if (!viewedIsbnString) return [];
      
      const viewedIsbns: string[] = JSON.parse(viewedIsbnString);
      const books: Book[] = [];
      
      for (const isbn of viewedIsbns.slice(0, 10)) {
        const book = await actor.getBook(isbn);
        if (book) books.push(book);
      }
      
      return books;
    },
    enabled: !!actor && !isFetching,
  });
}

// Track book view
export function useTrackBookView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isbn: string) => {
      const viewedIsbnString = localStorage.getItem('recentlyViewedBooks');
      const viewedIsbns: string[] = viewedIsbnString ? JSON.parse(viewedIsbnString) : [];
      
      // Remove if already exists and add to front
      const filteredIsbns = viewedIsbns.filter(i => i !== isbn);
      filteredIsbns.unshift(isbn);
      
      // Keep only last 10
      const updatedIsbns = filteredIsbns.slice(0, 10);
      localStorage.setItem('recentlyViewedBooks', JSON.stringify(updatedIsbns));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentlyViewed'] });
    },
  });
}

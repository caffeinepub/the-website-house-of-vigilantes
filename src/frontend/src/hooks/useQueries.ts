import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Book, UserProfile, BookSubmission } from '../backend';

export function useGetAllBooks() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Book[]>({
    queryKey: ['books', isAdmin],
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

export function useSubmitBookForApproval() {
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
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] });
    },
  });
}

export function useGetPendingSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<BookSubmission[]>({
    queryKey: ['pendingSubmissions'],
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
    mutationFn: async ({ isbn, isApproved, rejectionReason }: { isbn: string; isApproved: boolean; rejectionReason?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBookSubmission(isbn, isApproved, rejectionReason || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['book'] });
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

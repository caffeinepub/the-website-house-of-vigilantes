import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EditRequest {
    bookIsbn: string;
    authorId: Principal;
    message?: string;
}
export interface Rating {
    bookIsbn: string;
    userId: Principal;
    stars: bigint;
    timestamp: bigint;
}
export type Usage = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "approved";
    approved: null;
} | {
    __kind__: "rejected";
    rejected: string;
};
export interface Recommendation {
    book: Book;
    reason: string;
}
export interface BookSubmission {
    coverImageUrl: string;
    title: string;
    pdfFileUrl: string;
    isbn: string;
    createdAt: bigint;
    description: string;
    author: string;
    approvalStatus: Usage;
    genre: string;
    publicationYear: bigint;
    totalPages: bigint;
    editCount: bigint;
    uploaderId: Principal;
}
export interface ReadingProgress {
    bookIsbn: string;
    userId: Principal;
    lastUpdated: bigint;
    pagesRead: bigint;
}
export interface Book {
    coverImageUrl: string;
    title: string;
    pdfFileUrl: string;
    isbn: string;
    createdAt: bigint;
    description: string;
    author: string;
    approvalStatus: Usage;
    genre: string;
    publicationYear: bigint;
    editCount: bigint;
    pageCount: bigint;
    uploaderId: Principal;
}
export interface UserProfile {
    name: string;
    isAuthor: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRating(bookIsbn: string, stars: bigint): Promise<void>;
    approveBookSubmission(isbn: string, isApproved: boolean, rejectionReason: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearEditRequests(isbn: string): Promise<void>;
    deleteAccount(targetUser: Principal | null): Promise<void>;
    deleteBook(isbn: string): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllSubmissions(): Promise<Array<BookSubmission>>;
    getAllUserProgress(user: Principal): Promise<Array<[string, ReadingProgress]>>;
    getBook(isbn: string): Promise<Book | null>;
    getBookAverageRating(bookIsbn: string): Promise<number | null>;
    getBookCompletedUsers(bookIsbn: string): Promise<Array<Principal>>;
    getBookRatings(bookIsbn: string): Promise<Array<Rating>>;
    getBookmarkedBooks(user: Principal): Promise<Array<Book>>;
    getBooksByAuthor(author: string): Promise<Array<Book>>;
    getBooksByGenre(genre: string): Promise<Array<Book>>;
    getBooksByGenreAndAuthor(genre: string, author: string): Promise<Array<Book>>;
    getBooksByStatus(status: Usage): Promise<Array<Book>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEditRequests(isbn: string): Promise<Array<EditRequest>>;
    getPendingSubmissions(): Promise<Array<BookSubmission>>;
    getPersonalizedRecommendations(user: Principal): Promise<Array<Recommendation>>;
    getReadingProgress(user: Principal, bookIsbn: string): Promise<ReadingProgress | null>;
    getTrendingBooks(): Promise<Array<Book>>;
    getUserBookProgress(bookIsbn: string): Promise<ReadingProgress | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<{
        isAuthor: boolean;
        systemRole: UserRole;
    }>;
    isBookBookmarked(user: Principal, bookIsbn: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    promoteToAuthor(user: Principal): Promise<void>;
    requestMoreEdits(isbn: string, message: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPreferredGenres(genres: Array<string>): Promise<void>;
    submitBookForApproval(book: Book): Promise<void>;
    toggleBookmark(bookIsbn: string): Promise<void>;
    updateBook(isbn: string, updatedBook: Book): Promise<void>;
    updateReadingProgress(bookIsbn: string, pagesRead: bigint): Promise<void>;
}

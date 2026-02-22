import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ApprovalStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "approved";
    approved: null;
} | {
    __kind__: "rejected";
    rejected: string;
};
export interface Book {
    coverImageUrl: string;
    title: string;
    isbn: string;
    createdAt: bigint;
    description: string;
    author: string;
    approvalStatus: ApprovalStatus;
    publicationYear: bigint;
    editCount: bigint;
    uploaderId: Principal;
}
export interface BookSubmission {
    coverImageUrl: string;
    title: string;
    isbn: string;
    createdAt: bigint;
    description: string;
    author: string;
    approvalStatus: ApprovalStatus;
    publicationYear: bigint;
    editCount: bigint;
    uploaderId: Principal;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveBookSubmission(isbn: string, isApproved: boolean, rejectionReason: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBook(isbn: string): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllSubmissions(): Promise<Array<BookSubmission>>;
    getBook(isbn: string): Promise<Book | null>;
    getBooksByStatus(status: ApprovalStatus): Promise<Array<Book>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingSubmissions(): Promise<Array<BookSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitBookForApproval(book: Book): Promise<void>;
    updateBook(isbn: string, updatedBook: Book): Promise<void>;
}

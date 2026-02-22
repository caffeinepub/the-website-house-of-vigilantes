import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserRole = AccessControl.UserRole;

  public type UserProfile = {
    name : Text;
  };

  public type Book = {
    title : Text;
    author : Text;
    coverImageUrl : Text;
    description : Text;
    publicationYear : Nat;
    isbn : Text;
    uploaderId : Principal;
    approvalStatus : ApprovalStatus;
    editCount : Nat;
    createdAt : Int;
  };

  public type ApprovalStatus = {
    #pending;
    #approved;
    #rejected : Text;
  };

  public type BookSubmission = {
    title : Text;
    author : Text;
    coverImageUrl : Text;
    description : Text;
    publicationYear : Nat;
    isbn : Text;
    uploaderId : Principal;
    approvalStatus : ApprovalStatus;
    editCount : Nat;
    createdAt : Int;
  };

  let books = Map.empty<Text, Book>();
  let bookSubmissions = Map.empty<Text, BookSubmission>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Submit a book for approval (requires user role)
  public shared ({ caller }) func submitBookForApproval(book : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit books for approval");
    };

    if (books.containsKey(book.isbn)) {
      Runtime.trap("Book with this ISBN already exists");
    };

    switch (books.get(book.isbn)) {
      case (null) {
        switch (bookSubmissions.get(book.isbn)) {
          case (null) {
            bookSubmissions.add(
              book.isbn,
              { book with
                uploaderId = caller;
                approvalStatus = #pending;
                editCount = 0;
                createdAt = Time.now();
              },
            );
          };
          case (?_) {
            Runtime.trap("Existing book submission found, please wait for approval");
          };
        };
      };
      case (?_) {
        Runtime.trap("Book with this ISBN already exists");
      };
    };
  };

  // Approve or reject a book submission (admin only)
  public shared ({ caller }) func approveBookSubmission(isbn : Text, isApproved : Bool, rejectionReason : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve/reject book submissions");
    };

    switch (bookSubmissions.get(isbn)) {
      case (null) {
        Runtime.trap("Book submission not found");
      };
      case (?submission) {
        let finalStatus = if (isApproved) {
          #approved : ApprovalStatus;
        } else {
          switch (rejectionReason) {
            case (null) {
              #rejected("") : ApprovalStatus;
            };
            case (?reason) {
              #rejected(reason) : ApprovalStatus;
            };
          };
        };

        // Process submission with only one approval type (#approved or #rejected)
        let finalSubmission = {
          submission with approvalStatus = finalStatus : ApprovalStatus;
        };

        if (isApproved) {
          books.add(isbn, {
            title = finalSubmission.title;
            author = finalSubmission.author;
            coverImageUrl = finalSubmission.coverImageUrl;
            description = finalSubmission.description;
            publicationYear = finalSubmission.publicationYear;
            isbn = finalSubmission.isbn;
            uploaderId = finalSubmission.uploaderId;
            approvalStatus = #approved;
            editCount = finalSubmission.editCount;
            createdAt = finalSubmission.createdAt;
          });
        };

        // Remove from submissions map after processing
        bookSubmissions.remove(isbn);
      };
    };
  };

  // Update book with 3-edit limit (admins exempt)
  public shared ({ caller }) func updateBook(isbn : Text, updatedBook : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update books");
    };

    switch (books.get(isbn)) {
      case (null) {
        Runtime.trap("Book not found");
      };
      case (?existingBook) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          if (caller != existingBook.uploaderId) {
            Runtime.trap("Unauthorized: You can only modify your own books");
          };
          if (existingBook.editCount >= 3) {
            Runtime.trap("Edit limit reached");
          };
        };

        let newEditCount = if (AccessControl.isAdmin(accessControlState, caller)) {
          existingBook.editCount;
        } else {
          existingBook.editCount + 1;
        };

        books.add(
          isbn,
          {
            updatedBook with
            uploaderId = existingBook.uploaderId;
            createdAt = existingBook.createdAt;
            editCount = newEditCount;
          },
        );
      };
    };
  };

  // Delete book (admin or original uploader only)
  public shared ({ caller }) func deleteBook(isbn : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete books");
    };

    switch (books.get(isbn)) {
      case (null) {
        Runtime.trap("Book not found");
      };
      case (?book) {
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
          if (book.uploaderId != caller) {
            Runtime.trap("Unauthorized: Only admins or the uploader can delete this book");
          };
        };
        books.remove(isbn);
      };
    };
  };

  // Get book by ISBN (no auth required for approved books)
  public query ({ caller }) func getBook(isbn : Text) : async ?Book {
    books.get(isbn);
  };

  // Get books by status (pending/rejected restricted to admins)
  public query ({ caller }) func getBooksByStatus(status : ApprovalStatus) : async [Book] {
    switch (status) {
      case (#pending) {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
          Runtime.trap("Unauthorized: Only admins can view pending books");
        };
      };
      case (#rejected(_)) {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
          Runtime.trap("Unauthorized: Only admins can view rejected books");
        };
      };
      case (#approved) {};
    };
    books.values().filter(func(b) { b.approvalStatus == status }).toArray();
  };

  // Get all books (non-admins see only approved books)
  public query ({ caller }) func getAllBooks() : async [Book] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      books.values().toArray();
    } else {
      books.values().filter(func(b) {
        switch (b.approvalStatus) {
          case (#approved) { true };
          case (_) { false };
        };
      }).toArray();
    };
  };

  // Get all book submissions (admin only)
  public query ({ caller }) func getAllSubmissions() : async [BookSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view submissions");
    };
    bookSubmissions.values().toArray();
  };

  // Get pending book submissions (admin only)
  public query ({ caller }) func getPendingSubmissions() : async [BookSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending submissions");
    };
    bookSubmissions.values().filter(func(sub) { sub.approvalStatus == #pending }).toArray();
  };
};

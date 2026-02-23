import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module ApprovalStatus {
    public type Usage = {
      #pending;
      #approved;
      #rejected : Text;
    };
  };

  type UserRole = AccessControl.UserRole;

  type UserProfile = {
    name : Text;
    // Additional profile fields if needed
  };

  public type Book = {
    title : Text;
    author : Text;
    coverImageUrl : Text;
    description : Text;
    publicationYear : Nat;
    isbn : Text;
    uploaderId : Principal;
    approvalStatus : ApprovalStatus.Usage;
    genre : Text;
    editCount : Nat;
    createdAt : Int;
    pageCount : Nat;
    pdfFileUrl : Text;
  };

  type BookSubmission = {
    title : Text;
    author : Text;
    coverImageUrl : Text;
    description : Text;
    publicationYear : Nat;
    isbn : Text;
    uploaderId : Principal;
    approvalStatus : ApprovalStatus.Usage;
    genre : Text;
    editCount : Nat;
    createdAt : Int;
    totalPages : Nat;
    pdfFileUrl : Text;
  };

  public type ReadingProgress = {
    userId : Principal;
    bookIsbn : Text;
    pagesRead : Nat;
    lastUpdated : Int;
  };

  type EditRequest = {
    bookIsbn : Text;
    authorId : Principal;
    message : ?Text;
  };

  public type Rating = {
    userId : Principal;
    bookIsbn : Text;
    stars : Nat;
    timestamp : Int;
  };

  public type Recommendation = {
    book : Book;
    reason : Text;
  };

  func userIdToText(userId : Principal) : Text {
    userId.toText();
  };

  let books = Map.empty<Text, Book>();
  let bookSubmissions = Map.empty<Text, BookSubmission>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let readingProgressMap = Map.empty<Text, ReadingProgress>();
  let editRequests = Map.empty<Text, [EditRequest]>();

  let bookmarksMap = Map.empty<Principal, List.List<Text>>();
  let ratingsMap = Map.empty<Text, List.List<Rating>>();
  let genrePreferencesMap = Map.empty<Principal, List.List<Text>>();
  let lastAccessTime = Map.empty<Text, Int>();

  var initialized : Bool = false; // Track whether the system is initialized

  public shared ({ caller }) func deleteAccount(targetUser : ?Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete accounts");
    };

    // Determine which account to delete
    let userToDelete = switch (targetUser) {
      case (null) { caller }; // Delete own account
      case (?user) {
        // Only admins can delete other users' accounts
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only admins can delete other users' accounts");
        };
        user;
      };
    };

    // Remove user profile
    userProfiles.remove(userToDelete);

    // Remove all books authored by the user
    let userBooks = books.entries().filter(
      func((_, book)) { book.uploaderId == userToDelete }
    );
    for ((isbn, _) in userBooks) {
      books.remove(isbn);
    };

    // Remove all book submissions by the user
    let userSubmissions = bookSubmissions.entries().filter(
      func((_, submission)) { submission.uploaderId == userToDelete }
    );
    for ((isbn, _) in userSubmissions) {
      bookSubmissions.remove(isbn);
    };

    // Remove all reading progress for the user
    let userProgress = readingProgressMap.entries().filter(
      func((_, progress)) { progress.userId == userToDelete }
    );
    for ((key, _) in userProgress) {
      readingProgressMap.remove(key);
    };

    // Remove all edit requests by the user
    let userEditRequests = editRequests.entries().filter(
      func((_, requests)) {
        requests.any(func(req) { req.authorId == userToDelete })
      }
    );
    for ((isbn, requests) in userEditRequests) {
      let filteredRequests = requests.filter(
        func(req) { req.authorId != userToDelete }
      );
      if (filteredRequests.size() > 0) {
        editRequests.add(isbn, filteredRequests);
      } else {
        editRequests.remove(isbn);
      };
    };

    // Remove user's bookmarks
    bookmarksMap.remove(userToDelete);

    // Remove all ratings by the user from all books
    for ((isbn, ratings) in ratingsMap.entries()) {
      let filteredRatings = ratings.filter(
        func(rating) { rating.userId != userToDelete }
      );
      if (filteredRatings.isEmpty()) {
        ratingsMap.remove(isbn);
      } else {
        ratingsMap.add(isbn, filteredRatings);
      };
    };

    // Remove user's genre preferences
    genrePreferencesMap.remove(userToDelete);
  };

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

  func buildReadingProgressKey(userId : Principal, bookIsbn : Text) : Text {
    userIdToText(userId) # ":" # bookIsbn;
  };

  public shared ({ caller }) func submitBookForApproval(book : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit books for approval");
    };

    // Check if book with ISBN exists in final approved books
    switch (books.get(book.isbn)) {
      case (null) {
        // If doesn't exist, check in submissions
        switch (bookSubmissions.get(book.isbn)) {
          case (null) {
            bookSubmissions.add(
              book.isbn,
              {
                title = book.title;
                author = book.author;
                coverImageUrl = book.coverImageUrl;
                description = book.description;
                publicationYear = book.publicationYear;
                isbn = book.isbn;
                uploaderId = caller;
                approvalStatus = #pending;
                genre = book.genre;
                editCount = 0;
                createdAt = Time.now();
                totalPages = book.pageCount;
                pdfFileUrl = book.pdfFileUrl;
              },
            );
          };
          case (?_) { Runtime.trap("Existing book submission found, please wait for approval") };
        };
      };
      case (?_) { Runtime.trap("Book with this ISBN already exists") };
    };
  };

  public shared ({ caller }) func approveBookSubmission(isbn : Text, isApproved : Bool, rejectionReason : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve/reject book submissions");
    };

    switch (bookSubmissions.get(isbn)) {
      case (null) { Runtime.trap("Book submission not found") };
      case (?submission) {
        let finalStatus = if (isApproved) {
          #approved : ApprovalStatus.Usage;
        } else {
          switch (rejectionReason) {
            case (null) { #rejected("") : ApprovalStatus.Usage };
            case (?reason) { #rejected(reason) : ApprovalStatus.Usage };
          };
        };
        let finalSubmission = { submission with approvalStatus = finalStatus : ApprovalStatus.Usage };

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
            genre = finalSubmission.genre;
            pageCount = finalSubmission.totalPages;
            editCount = finalSubmission.editCount;
            createdAt = finalSubmission.createdAt;
            pdfFileUrl = finalSubmission.pdfFileUrl;
          });
        };
        bookSubmissions.remove(isbn);
      };
    };
  };

  public shared ({ caller }) func updateBook(isbn : Text, updatedBook : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update books");
    };

    switch (books.get(isbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?existingBook) {
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
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
          { updatedBook with uploaderId = existingBook.uploaderId; createdAt = existingBook.createdAt; editCount = newEditCount },
        );
      };
    };
  };

  public shared ({ caller }) func deleteBook(isbn : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete books");
    };

    switch (books.get(isbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
          if (book.uploaderId != caller) {
            Runtime.trap("Unauthorized: Only admins or the uploader can delete this book");
          };
        };
        let currentTime = Time.now();
        let lastInteractionTime = switch (lastAccessTime.get(isbn)) {
          case (null) { 0 };
          case (?time) { time };
        };
        lastAccessTime.add(isbn, currentTime);
        books.remove(isbn);
      };
    };
  };

  public query ({ caller }) func getBook(isbn : Text) : async ?Book {
    // Allow all authenticated users and guests to view approved books
    switch (books.get(isbn)) {
      case (null) { null };
      case (?book) {
        // Only admins can see non-approved books
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
          switch (book.approvalStatus) {
            case (#approved) { ?book };
            case (_) { null };
          };
        } else { ?book };
      };
    };
  };

  public query ({ caller }) func getBooksByStatus(status : ApprovalStatus.Usage) : async [Book] {
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
      case (#approved) {
        // Approved books are public, no restriction
      };
    };
    books.values().filter(func(b) { b.approvalStatus == status }).toArray();
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    // Allow all users including guests to view approved books
    // Only admins can see all books
    if (AccessControl.isAdmin(accessControlState, caller)) {
      books.values().toArray();
    } else {
      books.values().filter(
        func(b) {
          switch (b.approvalStatus) {
            case (#approved) { true };
            case (_) { false };
          };
        }
      ).toArray();
    };
  };

  public query ({ caller }) func getBooksByGenre(genre : Text) : async [Book] {
    // Allow all users including guests to view approved books by genre
    if (AccessControl.isAdmin(accessControlState, caller)) {
      books.values().filter(func(b) { b.genre == genre }).toArray();
    } else {
      books.values().filter(
        func(b) {
          b.genre == genre and (
            b.approvalStatus == #approved
          );
        }
      ).toArray();
    };
  };

  public query ({ caller }) func getBooksByAuthor(author : Text) : async [Book] {
    // Allow all users including guests to view approved books by author
    if (AccessControl.isAdmin(accessControlState, caller)) {
      books.values().filter(func(b) { b.author == author }).toArray();
    } else {
      books.values().filter(
        func(b) {
          b.author == author and (
            b.approvalStatus == #approved
          );
        }
      ).toArray();
    };
  };

  public query ({ caller }) func getBooksByGenreAndAuthor(genre : Text, author : Text) : async [Book] {
    // Allow all users including guests to view approved books by genre and author
    if (AccessControl.isAdmin(accessControlState, caller)) {
      books.values().filter(
        func(b) { b.genre == genre and b.author == author }
      ).toArray();
    } else {
      books.values().filter(
        func(b) {
          b.genre == genre and b.author == author and (b.approvalStatus == #approved);
        }
      ).toArray();
    };
  };

  public query ({ caller }) func getAllSubmissions() : async [BookSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view submissions");
    };
    bookSubmissions.values().toArray();
  };

  public query ({ caller }) func getPendingSubmissions() : async [BookSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending submissions");
    };
    bookSubmissions.values().filter(func(sub) { sub.approvalStatus == #pending }).toArray();
  };

  public shared ({ caller }) func updateReadingProgress(bookIsbn : Text, pagesRead : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update reading progress");
    };

    switch (books.get(bookIsbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?_) {
        let progressKey = buildReadingProgressKey(caller, bookIsbn);
        readingProgressMap.add(progressKey, {
          userId = caller;
          bookIsbn;
          pagesRead;
          lastUpdated = Time.now();
        });
      };
    };
  };

  public query ({ caller }) func getReadingProgress(user : Principal, bookIsbn : Text) : async ?ReadingProgress {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own reading progress");
    };
    let progressKey = buildReadingProgressKey(user, bookIsbn);
    readingProgressMap.get(progressKey);
  };

  public query ({ caller }) func getUserBookProgress(bookIsbn : Text) : async ?ReadingProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own progress");
    };
    let progressKey = buildReadingProgressKey(caller, bookIsbn);
    readingProgressMap.get(progressKey);
  };

  public query ({ caller }) func getAllUserProgress(user : Principal) : async [(Text, ReadingProgress)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user progress");
    };
    readingProgressMap.entries().filter(
      func((_, p)) { p.userId == user }
    ).toArray();
  };

  public query ({ caller }) func getBookCompletedUsers(bookIsbn : Text) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can see completed book users");
    };
    switch (books.get(bookIsbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        readingProgressMap.toArray().filter(
          func((_, p)) {
            p.bookIsbn == book.isbn and p.pagesRead >= book.pageCount;
          }
        ).map(func((_, p)) { p.userId });
      };
    };
  };

  public shared ({ caller }) func requestMoreEdits(isbn : Text, message : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request more edits");
    };

    switch (books.get(isbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        if (book.uploaderId != caller) {
          Runtime.trap("Unauthorized: Only the author can request more edits");
        };

        let newRequest : EditRequest = {
          bookIsbn = isbn;
          authorId = caller;
          message;
        };

        let currentRequests = switch (editRequests.get(isbn)) {
          case (null) { [] : [EditRequest] };
          case (?requests) { requests };
        };
        let updatedRequests = [newRequest].concat(currentRequests);
        editRequests.add(isbn, updatedRequests);
      };
    };
  };

  public query ({ caller }) func getEditRequests(isbn : Text) : async [EditRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view edit requests");
    };
    switch (editRequests.get(isbn)) {
      case (null) { [] };
      case (?requests) { requests };
    };
  };

  public shared ({ caller }) func clearEditRequests(isbn : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear edit requests");
    };
    editRequests.remove(isbn);
  };

  public shared ({ caller }) func toggleBookmark(bookIsbn : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can bookmark");
    };
    let currentBookmarks = switch (bookmarksMap.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?b) { b };
    };
    let containsBookmark = currentBookmarks.any(func(isbn) { isbn == bookIsbn });
    if (containsBookmark) {
      let filteredList = currentBookmarks.filter(
        func(isbn) { isbn != bookIsbn }
      );
      bookmarksMap.add(caller, filteredList);
    } else {
      currentBookmarks.add(bookIsbn);
      bookmarksMap.add(caller, currentBookmarks);
    };
  };

  public query ({ caller }) func getBookmarkedBooks(user : Principal) : async [Book] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookmarks");
    };
    let bookmarks = switch (bookmarksMap.get(user)) {
      case (null) { List.empty<Text>() };
      case (?b) { b };
    };
    bookmarks.toArray().map(func(isbn) { switch (books.get(isbn)) { case (?book) { book }; case (null) { Runtime.trap("Book not found") } } });
  };

  public query ({ caller }) func isBookBookmarked(user : Principal, bookIsbn : Text) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own bookmarks");
    };
    let bookmarks = switch (bookmarksMap.get(user)) {
      case (null) { List.empty<Text>() };
      case (?b) { b };
    };
    bookmarks.any(func(isbn) { isbn == bookIsbn });
  };

  public shared ({ caller }) func addRating(bookIsbn : Text, stars : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can rate books");
    };
    if (stars < 1 or stars > 5) { Runtime.trap("Rating must be between 1 and 5 stars") };
    switch (books.get(bookIsbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?_) {
        let newRating = {
          userId = caller;
          bookIsbn;
          stars;
          timestamp = Time.now();
        };
        let currentRatings = switch (ratingsMap.get(bookIsbn)) {
          case (null) { List.empty<Rating>() };
          case (?r) { r };
        };
        let filteredRatings = currentRatings.filter(func(rating) { rating.userId != caller });
        filteredRatings.add(newRating);
        ratingsMap.add(bookIsbn, filteredRatings);
      };
    };
  };

  public query ({ caller }) func getBookRatings(bookIsbn : Text) : async [Rating] {
    // Public information - anyone can view ratings for approved books
    switch (books.get(bookIsbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        // Only show ratings for approved books to non-admins
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
          switch (book.approvalStatus) {
            case (#approved) {
              switch (ratingsMap.get(bookIsbn)) {
                case (null) { [] };
                case (?ratings) { ratings.toArray() };
              };
            };
            case (_) { [] };
          };
        } else {
          switch (ratingsMap.get(bookIsbn)) {
            case (null) { [] };
            case (?ratings) { ratings.toArray() };
          };
        };
      };
    };
  };

  public query ({ caller }) func getBookAverageRating(bookIsbn : Text) : async ?Float {
    // Public information - anyone can view average rating for approved books
    switch (books.get(bookIsbn)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        // Only show ratings for approved books to non-admins
        if (not (AccessControl.isAdmin(accessControlState, caller))) {
          switch (book.approvalStatus) {
            case (#approved) {
              let ratings = switch (ratingsMap.get(bookIsbn)) {
                case (null) { List.empty<Rating>() };
                case (?r) { r };
              };
              if (ratings.isEmpty()) { null } else {
                var totalStars : Float = 0;
                ratings.forEach(func(rating) { totalStars += rating.stars.toFloat() });
                ?(if (ratings.size() > 0) {
                  totalStars / ratings.size().toFloat();
                } else {
                  0;
                });
              };
            };
            case (_) { null };
          };
        } else {
          let ratings = switch (ratingsMap.get(bookIsbn)) {
            case (null) { List.empty<Rating>() };
            case (?r) { r };
          };
          if (ratings.isEmpty()) { null } else {
            var totalStars : Float = 0;
            ratings.forEach(func(rating) { totalStars += rating.stars.toFloat() });
            ?(if (ratings.size() > 0) {
              totalStars / ratings.size().toFloat();
            } else {
              0;
            });
          };
        };
      };
    };
  };

  public query ({ caller }) func getTrendingBooks() : async [Book] {
    // Public information - anyone can view trending approved books
    let currentTime = Time.now();
    let recentBooks = if (AccessControl.isAdmin(accessControlState, caller)) {
      books.values().filter(
        func(b) { currentTime - b.createdAt <= 30 * 24 * 60 * 60 * 1000000000 }
      ).toArray();
    } else {
      books.values().filter(
        func(b) { 
          currentTime - b.createdAt <= 30 * 24 * 60 * 60 * 1000000000 and 
          b.approvalStatus == #approved 
        }
      ).toArray();
    };
    
    let compareBooksByRating = func(a : Book, b : Book) : Order.Order {
      let ratingA = switch (ratingsMap.get(a.isbn)) {
        case (null) { 0 };
        case (?ratings) {
          var total : Nat = 0;
          var count : Nat = 0;
          ratings.forEach(func(star) { total += star.stars; count += 1 });
          if (count == 0) { 0 } else { total / count };
        };
      };
      let ratingB = switch (ratingsMap.get(b.isbn)) {
        case (null) { 0 };
        case (?ratings) {
          var total : Nat = 0;
          var count : Nat = 0;
          ratings.forEach(func(star) { total += star.stars; count += 1 });
          if (count == 0) { 0 } else { total / count };
        };
      };
      Float.compare(ratingB.toFloat(), ratingA.toFloat());
    };
    recentBooks.sort(compareBooksByRating);
  };

  public shared ({ caller }) func setPreferredGenres(genres : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set preferences");
    };
    genrePreferencesMap.add(
      caller,
      List.fromArray<Text>(genres),
    );
  };

  public query ({ caller }) func getPersonalizedRecommendations(user : Principal) : async [Recommendation] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own recommendations");
    };
    
    // Filter to only show approved books for non-admins
    let availableBooks = if (AccessControl.isAdmin(accessControlState, caller)) {
      books.toArray();
    } else {
      books.toArray().filter(
        func((_, book)) { book.approvalStatus == #approved }
      );
    };
    
    let topBooks = availableBooks.sliceToArray(0, Nat.min(5, availableBooks.size()));
    let recommendations = topBooks.map(func((_, book)) { { book; reason = "Trending book" } });
    recommendations;
  };
};

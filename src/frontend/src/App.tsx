import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import ProfileSetupModal from './components/ProfileSetupModal';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import BrowseBooksPage from './pages/BrowseBooksPage';
import BookDetailPage from './pages/BookDetailPage';
import UploadBookPage from './pages/UploadBookPage';
import MyBooksPage from './pages/MyBooksPage';
import AdminPage from './pages/AdminPage';
import AdminReviewPage from './pages/AdminReviewPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminCollectionsPage from './pages/AdminCollectionsPage';
import AdminModerationPage from './pages/AdminModerationPage';
import FavoritesPage from './pages/FavoritesPage';
import PersonalizedHomePage from './pages/PersonalizedHomePage';
import AuthorsPage from './pages/AuthorsPage';
import ProfilePage from './pages/ProfilePage';
import AuthorProfilePage from './pages/AuthorProfilePage';
import AuthorDashboardPage from './pages/AuthorDashboardPage';
import SocialPage from './pages/SocialPage';
import DiscussionsPage from './pages/DiscussionsPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';

const queryClient = new QueryClient();

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ProfileSetupModal />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

const personalizedRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/home',
  component: PersonalizedHomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/browse',
  component: BrowseBooksPage,
});

const authorsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/authors',
  component: AuthorsPage,
});

const authorProfileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/author/$authorName',
  component: AuthorProfilePage,
});

const authorDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/author/dashboard',
  component: AuthorDashboardPage,
});

const bookDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/book/$isbn',
  component: BookDetailPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/upload',
  component: UploadBookPage,
});

const myBooksRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/my-books',
  component: MyBooksPage,
});

const adminRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin',
  component: AdminPage,
});

const adminReviewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/review',
  component: AdminReviewPage,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/analytics',
  component: AdminAnalyticsPage,
});

const adminCollectionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/collections',
  component: AdminCollectionsPage,
});

const adminModerationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/moderation',
  component: AdminModerationPage,
});

const favoritesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/favorites',
  component: FavoritesPage,
});

const profileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/profile',
  component: ProfilePage,
});

const socialRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/social',
  component: SocialPage,
});

const discussionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/discussions',
  component: DiscussionsPage,
});

const threadDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/discussions/$threadId',
  component: ThreadDetailPage,
});

const collectionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/collections',
  component: CollectionsPage,
});

const collectionDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/collections/$collectionId',
  component: CollectionDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authenticatedRoute.addChildren([
    personalizedRoute,
    browseRoute,
    authorsRoute,
    authorProfileRoute,
    authorDashboardRoute,
    bookDetailRoute,
    uploadRoute,
    myBooksRoute,
    adminRoute,
    adminReviewRoute,
    adminAnalyticsRoute,
    adminCollectionsRoute,
    adminModerationRoute,
    favoritesRoute,
    profileRoute,
    socialRoute,
    discussionsRoute,
    threadDetailRoute,
    collectionsRoute,
    collectionDetailRoute,
  ]),
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="theme-preference">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

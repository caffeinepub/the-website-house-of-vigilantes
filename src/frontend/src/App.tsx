import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import AdminPage from './pages/AdminPage';
import UploadBookPage from './pages/UploadBookPage';
import MyBooksPage from './pages/MyBooksPage';
import AdminReviewPage from './pages/AdminReviewPage';
import BrowseBooksPage from './pages/BrowseBooksPage';
import FavoritesPage from './pages/FavoritesPage';
import Navigation from './components/Navigation';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProfileSetupModal />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseBooksPage,
});

const bookDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$isbn',
  component: BookDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadBookPage,
});

const myBooksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-books',
  component: MyBooksPage,
});

const adminReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/review',
  component: AdminReviewPage,
});

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: FavoritesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  bookDetailRoute,
  adminRoute,
  uploadRoute,
  myBooksRoute,
  adminReviewRoute,
  favoritesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function Footer() {
  const appIdentifier = encodeURIComponent(window.location.hostname || 'house-of-vigilantes');
  
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} House of Vigilantes. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <span className="text-destructive">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

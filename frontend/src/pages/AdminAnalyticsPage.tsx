import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserRole, useGetAllBooks, useGetTrendingBooks } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { BarChart3, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStatsCard from '../components/DashboardStatsCard';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const { data: roleData, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: allBooks = [], isLoading: booksLoading } = useGetAllBooks();
  const { data: trendingBooks = [] } = useGetTrendingBooks();

  const isAdmin = roleData?.systemRole === UserRole.admin;

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate({ to: '/home' });
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading || booksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const approvedBooks = allBooks.filter(b => b.approvalStatus.__kind__ === 'approved');
  const genreCounts = approvedBooks.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-vangogh-blue mb-2">
          Site Analytics
        </h1>
        <p className="text-muted-foreground">Overview of platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardStatsCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total Books"
          value={allBooks.length.toString()}
          trend="+12%"
        />
        <DashboardStatsCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Approved Books"
          value={approvedBooks.length.toString()}
          trend="+8%"
        />
        <DashboardStatsCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value="--"
          trend=""
        />
        <DashboardStatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Active Users"
          value="--"
          trend="+15%"
        />
      </div>

      {/* Trending Books */}
      <Card className="mb-8 border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-vangogh-blue flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Top 10 Trending Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendingBooks.length > 0 ? (
            <div className="space-y-3">
              {trendingBooks.slice(0, 10).map((book, index) => (
                <div key={book.isbn} className="flex items-center gap-4 p-3 rounded-xl hover:bg-vangogh-yellow/10 transition-colors">
                  <div className="text-2xl font-bold text-vangogh-blue w-8">
                    #{index + 1}
                  </div>
                  <img
                    src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No trending books yet</p>
          )}
        </CardContent>
      </Card>

      {/* Genre Distribution */}
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-vangogh-blue flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Genre Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(genreCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([genre, count]) => (
                <div key={genre}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{genre}</span>
                    <span className="text-muted-foreground">{count} books</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-vangogh-blue to-vangogh-gold rounded-full transition-all"
                      style={{ width: `${(count / approvedBooks.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

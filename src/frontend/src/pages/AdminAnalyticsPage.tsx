import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetAllBooks, useGetTrendingBooks } from '../hooks/useQueries';
import { BarChart3, BookOpen, Users, TrendingUp, Eye, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStatsCard from '../components/DashboardStatsCard';
import { useEffect } from 'react';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: allBooks = [], isLoading: booksLoading } = useGetAllBooks();
  const { data: trendingBooks = [] } = useGetTrendingBooks();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate({ to: '/home' });
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || booksLoading) {
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
  const totalBooks = approvedBooks.length;
  const totalUsers = new Set(allBooks.map(b => b.uploaderId.toString())).size;
  const activeUsers = totalUsers;

  const genreDistribution = approvedBooks.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topGenres = Object.entries(genreDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-2">
            Admin Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Site-wide metrics and trends
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardStatsCard
            icon={<BookOpen className="h-6 w-6" />}
            label="Total Books"
            value={totalBooks.toString()}
          />
          <DashboardStatsCard
            icon={<Users className="h-6 w-6" />}
            label="Total Users"
            value={totalUsers.toString()}
          />
          <DashboardStatsCard
            icon={<Users className="h-6 w-6" />}
            label="Active Users"
            value={activeUsers.toString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2 border-vangogh-yellow/30 shadow-vangogh-glow">
            <CardHeader>
              <CardTitle className="font-serif text-vangogh-blue flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 10 Most Viewed Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingBooks.slice(0, 10).map((book, index) => (
                  <div key={book.isbn} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-vangogh-blue text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{book.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {trendingBooks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No trending books yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-vangogh-yellow/30 shadow-vangogh-glow">
            <CardHeader>
              <CardTitle className="font-serif text-vangogh-blue flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Genre Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topGenres.map(([genre, count]) => {
                  const percentage = totalBooks > 0 ? (count / totalBooks) * 100 : 0;
                  return (
                    <div key={genre}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{genre}</span>
                        <span className="text-sm text-muted-foreground">{count} books ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-vangogh-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {topGenres.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No genre data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

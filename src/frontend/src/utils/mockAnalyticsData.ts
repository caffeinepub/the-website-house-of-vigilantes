export interface AnalyticsData {
  views: number;
  reads: number;
  favorites: number;
  completionRate: number;
  trendingPosition: number;
  trends: Array<{ date: string; value: number }>;
  progressDistribution: Array<{ label: string; percentage: number }>;
}

export function getMockAnalyticsData(bookIsbn: string): AnalyticsData {
  // Generate consistent mock data based on ISBN
  const seed = bookIsbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const baseViews = random(500, 5000);
  const baseReads = Math.floor(baseViews * 0.6);

  return {
    views: baseViews,
    reads: baseReads,
    favorites: random(50, 500),
    completionRate: random(45, 85),
    trendingPosition: random(1, 50),
    trends: [
      { date: 'Mon', value: random(50, 200) },
      { date: 'Tue', value: random(60, 220) },
      { date: 'Wed', value: random(70, 250) },
      { date: 'Thu', value: random(80, 280) },
      { date: 'Fri', value: random(90, 300) },
      { date: 'Sat', value: random(100, 350) },
      { date: 'Sun', value: random(85, 320) },
    ],
    progressDistribution: [
      { label: '0-25% read', percentage: random(20, 35) },
      { label: '26-50% read', percentage: random(15, 25) },
      { label: '51-75% read', percentage: random(10, 20) },
      { label: '76-99% read', percentage: random(8, 15) },
      { label: 'Completed', percentage: random(15, 30) },
    ],
  };
}

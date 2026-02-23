import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}

export default function DashboardStatsCard({
  icon,
  label,
  value,
  trend,
}: DashboardStatsCardProps) {
  return (
    <Card className="border-2 border-vangogh-yellow/30 rounded-2xl hover:shadow-vangogh-glow transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-vangogh-blue/10 rounded-xl text-vangogh-blue">
            {icon}
          </div>
          {trend && (
            <span className="text-xs font-medium text-green-600">
              {trend}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-vangogh-blue mb-1">
          {value}
        </div>
        <div className="text-sm text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

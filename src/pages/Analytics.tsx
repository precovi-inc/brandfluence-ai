import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useContentLibrary } from '@/hooks/useContentLibrary';
import { FileText, Calendar, TrendingUp, BarChart3, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';

const platformData = [
  { name: 'Instagram', icon: Instagram, color: 'bg-instagram', posts: 0 },
  { name: 'Twitter', icon: Twitter, color: 'bg-twitter', posts: 0 },
  { name: 'LinkedIn', icon: Linkedin, color: 'bg-linkedin', posts: 0 },
  { name: 'Facebook', icon: Facebook, color: 'bg-facebook', posts: 0 },
];

export default function Analytics() {
  const { content } = useContentLibrary();

  const totalPosts = content.length;
  const drafts = content.filter((p) => p.status === 'draft').length;
  const scheduled = content.filter((p) => p.status === 'scheduled').length;
  const published = content.filter((p) => p.status === 'published').length;

  // Calculate platform distribution
  const platformCounts = content.reduce((acc, post) => {
    post.platforms.forEach((platform) => {
      acc[platform] = (acc[platform] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const platforms = platformData.map((p) => ({
    ...p,
    posts: platformCounts[p.name.toLowerCase()] || 0,
  }));

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your content performance and insights
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Posts"
            value={totalPosts}
            icon={FileText}
            description="All time content"
          />
          <StatsCard
            title="Drafts"
            value={drafts}
            icon={FileText}
            description="Work in progress"
          />
          <StatsCard
            title="Scheduled"
            value={scheduled}
            icon={Calendar}
            description="Ready to publish"
          />
          <StatsCard
            title="Published"
            value={published}
            icon={TrendingUp}
            description="Live content"
          />
        </div>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-4 rounded-xl border border-border p-4"
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl text-white',
                      platform.color
                    )}
                  >
                    <platform.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{platform.posts}</p>
                    <p className="text-sm text-muted-foreground">{platform.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">Activity charts coming soon</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create more content to see detailed analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

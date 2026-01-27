import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentPosts } from '@/components/dashboard/RecentPosts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingPosts } from '@/components/dashboard/UpcomingPosts';
import { useProfile } from '@/hooks/useProfile';
import { useContentLibrary } from '@/hooks/useContentLibrary';
import { FileText, Calendar, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useProfile();
  const { content } = useContentLibrary();

  const totalPosts = content.length;
  const scheduledPosts = content.filter((p) => p.status === 'scheduled').length;
  const publishedPosts = content.filter((p) => p.status === 'published').length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your content today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Posts"
            value={totalPosts}
            icon={FileText}
            description="All time"
          />
          <StatsCard
            title="Scheduled"
            value={scheduledPosts}
            icon={Calendar}
            description="Ready to publish"
          />
          <StatsCard
            title="Published"
            value={publishedPosts}
            icon={TrendingUp}
            description="Live posts"
          />
          <StatsCard
            title="AI Generated"
            value={totalPosts}
            icon={Sparkles}
            description="Smart content"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RecentPosts />
            <UpcomingPosts />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

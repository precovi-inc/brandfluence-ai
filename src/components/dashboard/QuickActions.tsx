import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, Palette, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Create Post',
    description: 'Generate AI-powered content',
    href: '/create',
    icon: PenTool,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Brand Studio',
    description: 'Configure your brand voice',
    href: '/brand',
    icon: Palette,
    color: 'bg-accent/10 text-accent',
  },
  {
    title: 'Schedule',
    description: 'Plan your content calendar',
    href: '/calendar',
    icon: Calendar,
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Automation',
    description: 'Set up smart workflows',
    href: '/automation',
    icon: Zap,
    color: 'bg-warning/10 text-warning',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="group rounded-xl border border-border p-4 transition-smooth hover:border-primary/50 hover:shadow-sm"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-smooth',
                  action.color
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-medium text-sm">{action.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

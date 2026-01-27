import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Clock, Calendar, Sparkles, Plus } from 'lucide-react';

const automationTemplates = [
  {
    id: 1,
    title: 'Motivation Monday',
    description: 'Automatically generate an inspirational post every Monday morning',
    icon: Sparkles,
    frequency: 'Weekly',
    active: false,
  },
  {
    id: 2,
    title: 'Weekly Tips',
    description: 'Share industry tips and insights every Wednesday',
    icon: Sparkles,
    frequency: 'Weekly',
    active: false,
  },
  {
    id: 3,
    title: 'Friday Recap',
    description: 'Summarize the week\'s highlights every Friday',
    icon: Sparkles,
    frequency: 'Weekly',
    active: false,
  },
];

export default function Automation() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Automation</h1>
            <p className="mt-1 text-muted-foreground">
              Set up automated content generation workflows
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Posts Generated</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Scheduled This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Templates */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Workflow Templates</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {automationTemplates.map((template) => (
              <Card key={template.id} className="transition-smooth hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <template.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Switch checked={template.active} />
                  </div>
                  <CardTitle className="mt-3 text-base">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{template.frequency}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Advanced Automation Coming Soon</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground max-w-md">
              Create custom workflows with triggers, conditions, and actions to fully automate your content pipeline
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

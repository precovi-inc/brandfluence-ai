import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { PlatformVariation } from '@/hooks/useContentGeneration';
import { ArrowLeft, Save, Send, Loader2, CheckCircle2, Instagram, Twitter, Linkedin, Facebook, CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FinalizeStepProps {
  title: string;
  variations: PlatformVariation[];
  mediaImages: string[];
  onBack: () => void;
  onSave: (status: 'draft' | 'published', scheduledAt?: Date) => Promise<void>;
  isSaving: boolean;
}

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-instagram',
  twitter: 'bg-twitter',
  linkedin: 'bg-linkedin',
  facebook: 'bg-facebook',
};

export function FinalizeStep({ title, variations, mediaImages, onBack, onSave, isSaving }: FinalizeStepProps) {
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saved, setSaved] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('09:00');

  const getScheduledAt = (): Date | undefined => {
    if (!scheduledDate) return undefined;
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(hours, minutes, 0, 0);
    return scheduled;
  };

  const handleSave = async () => {
    await onSave(status, getScheduledAt());
    setSaved(true);
  };

  if (saved) {
    return (
      <Card className="animate-fade-up">
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Post Saved Successfully!</h2>
            <p className="text-muted-foreground max-w-md">
              Your post has been saved as <Badge variant="secondary" className="mx-1">{status}</Badge> to your content library.
              {scheduledDate && (
                <span className="block mt-1">
                  Scheduled for {format(getScheduledAt()!, 'PPP')} at {scheduledTime}
                </span>
              )}
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" asChild>
                <a href="/content-library">View Library</a>
              </Button>
              <Button onClick={() => window.location.reload()}>Create Another</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <Card>
        <CardHeader>
          <CardTitle>Finalize & Save</CardTitle>
          <CardDescription>Review your content and save to your library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Post Summary */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Title</Label>
            <p className="font-medium">{title}</p>
          </div>

          {/* Platform Previews */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Platforms</Label>
            <div className="grid gap-3">
              {variations.map((v) => {
                const Icon = platformIcons[v.platform] || Send;
                return (
                  <div key={v.platform} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', platformColors[v.platform] || 'bg-muted')}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium capitalize text-sm">{v.platform}</span>
                      <Badge variant="outline" className="ml-auto text-xs">{v.characterCount} chars</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{v.content}</p>
                    {v.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {v.hashtags.map((h) => (
                          <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Media */}
          {mediaImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Media ({mediaImages.length})</Label>
              <div className="flex gap-2 overflow-x-auto">
                {mediaImages.map((url, i) => (
                  <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                ))}
              </div>
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Save As</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
              <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="draft" id="draft" className="mt-0.5" />
                <div>
                  <Label htmlFor="draft" className="font-medium cursor-pointer">Draft</Label>
                  <p className="text-sm text-muted-foreground">Save to your library for later editing or scheduling</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="published" id="published" className="mt-0.5" />
                <div>
                  <Label htmlFor="published" className="font-medium cursor-pointer">Published</Label>
                  <p className="text-sm text-muted-foreground">Mark as published and save to your library</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Scheduling */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Schedule (optional)</Label>
            <p className="text-sm text-muted-foreground">Pick a date and time to schedule this post for later.</p>
            <div className="flex flex-wrap gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[200px] justify-start text-left font-normal',
                      !scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-[130px]"
                />
              </div>
              {scheduledDate && (
                <Button variant="ghost" size="sm" onClick={() => setScheduledDate(undefined)} className="text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>
            {scheduledDate && (
              <p className="text-xs text-muted-foreground">
                Scheduled for {format(scheduledDate, 'PPP')} at {scheduledTime}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2" disabled={isSaving}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : status === 'draft' ? (
            <>
              <Save className="h-4 w-4" />
              Save as Draft
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Save as Published
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

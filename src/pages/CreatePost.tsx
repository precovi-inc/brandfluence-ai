import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Check, Instagram, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { ImageGallery } from '@/components/create-post/ImageGallery';
import { GeneratedContentCard } from '@/components/create-post/GeneratedContentCard';
import { CraftStep } from '@/components/create-post/CraftStep';
import { FinalizeStep } from '@/components/create-post/FinalizeStep';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useContentLibrary } from '@/hooks/useContentLibrary';
import { toast } from 'sonner';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-instagram' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-twitter' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-linkedin' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-facebook' },
];

const steps = ['Brief', 'Generate', 'Craft', 'Finalize'];

export default function CreatePost() {
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [direction, setDirection] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [regeneratingPlatform, setRegeneratingPlatform] = useState<string | null>(null);
  
  const { isGenerating, variations, generateContent, updateVariation, regenerateSingle } = useContentGeneration();
  const { createPost, isCreating } = useContentLibrary();

  const handleSave = async (status: 'draft' | 'published') => {
    const allHashtags = variations.flatMap(v => v.hashtags);
    const uniqueHashtags = [...new Set(allHashtags)];
    const primaryContent = variations[0]?.content || '';

    return new Promise<void>((resolve, reject) => {
      createPost(
        {
          title,
          content: primaryContent,
          platforms: selectedPlatforms,
          media_urls: mediaImages,
          hashtags: uniqueHashtags,
          status,
          ai_variations: variations.map(v => ({ content: v.content, platform: v.platform })),
          published_at: status === 'published' ? new Date().toISOString() : null,
        },
        {
          onSuccess: () => {
            toast.success(`Post saved as ${status}!`);
            resolve();
          },
          onError: (err) => {
            toast.error('Failed to save post');
            reject(err);
          },
        }
      );
    });
  };
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    const result = await generateContent({
      title,
      direction,
      platforms: selectedPlatforms,
      imageUrls: mediaImages,
    });
    
    if (result) {
      setCurrentStep(1);
    }
  };

  const handleRegenerate = async (platform: string) => {
    setRegeneratingPlatform(platform);
    await regenerateSingle(platform, {
      title,
      direction,
      platforms: [platform],
      imageUrls: mediaImages,
    });
    setRegeneratingPlatform(null);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Post</h1>
          <p className="mt-1 text-muted-foreground">
            Let AI generate on-brand content for your social media
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-smooth',
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'ml-2 text-sm font-medium',
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="mx-3 h-4 w-4 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>Create Your Brief</CardTitle>
              <CardDescription>
                Tell us what you want to communicate. Be specific about your message and goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Product launch announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {platforms.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-smooth',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            platform.color
                          )}
                        >
                          <platform.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Creative Direction</Label>
                <Textarea
                  id="direction"
                  placeholder="Describe what you want to communicate, your key message, tone, and any specific requirements..."
                  rows={4}
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                />
              </div>

              <ImageGallery
                images={mediaImages}
                onImagesChange={setMediaImages}
                maxImages={10}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleGenerate}
                  disabled={!title || selectedPlatforms.length === 0 || !direction || isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-up">
            <Card>
              <CardHeader>
                <CardTitle>AI Generated Content</CardTitle>
                <CardDescription>
                  Review and edit the AI-generated variations for each platform
                </CardDescription>
              </CardHeader>
            </Card>

            {variations.length > 0 ? (
              <div className="space-y-4">
                {variations.map((variation) => (
                  <GeneratedContentCard
                    key={variation.platform}
                    variation={variation}
                    onContentChange={(content) => updateVariation(variation.platform, content)}
                    onRegenerate={() => handleRegenerate(variation.platform)}
                    isRegenerating={regeneratingPlatform === variation.platform}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 animate-pulse-subtle items-center justify-center rounded-2xl bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <p className="mt-4 font-medium">Generating content...</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Creating variations tailored to your brand
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(2)} disabled={variations.length === 0}>
                Continue to Edit
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <CraftStep
            variations={variations}
            onVariationChange={updateVariation}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <FinalizeStep
            title={title}
            variations={variations}
            mediaImages={mediaImages}
            onBack={() => setCurrentStep(2)}
            onSave={handleSave}
            isSaving={isCreating}
          />
        )}
      </div>
    </AppLayout>
  );
}

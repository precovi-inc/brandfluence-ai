import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBrands } from '@/hooks/useBrands';
import { useState } from 'react';
import { Palette, Plus, Globe, Instagram, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const voiceOptions = [
  'Professional', 'Friendly', 'Bold', 'Confident', 'Warm',
  'Casual', 'Authoritative', 'Playful', 'Inspirational', 'Educational'
];

export default function BrandStudio() {
  const { brands, createBrand, isCreating } = useBrands();
  const [showForm, setShowForm] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [facebookHandle, setFacebookHandle] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string[]>([]);
  const [mission, setMission] = useState('');

  const toggleVoice = (voice: string) => {
    setSelectedVoice((prev) =>
      prev.includes(voice)
        ? prev.filter((v) => v !== voice)
        : prev.length < 3 ? [...prev, voice] : prev
    );
  };

  const handleCreateBrand = () => {
    if (!brandName) {
      toast.error('Please enter a brand name');
      return;
    }

    createBrand({
      name: brandName,
      website_url: websiteUrl || null,
      instagram_handle: instagramHandle || null,
      twitter_handle: twitterHandle || null,
      linkedin_handle: linkedinHandle || null,
      facebook_handle: facebookHandle || null,
      voice_characteristics: selectedVoice,
      brand_essence: { mission, values: [], usp: '' },
    }, {
      onSuccess: () => {
        toast.success('Brand created successfully!');
        setShowForm(false);
        setBrandName('');
        setWebsiteUrl('');
        setSelectedVoice([]);
        setMission('');
      },
      onError: (error) => {
        toast.error('Failed to create brand');
        console.error(error);
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Brand Studio</h1>
            <p className="mt-1 text-muted-foreground">
              Configure your brand identity for consistent AI-generated content
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Brand
          </Button>
        </div>

        {/* Brand Creation Form */}
        {showForm && (
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>Create New Brand</CardTitle>
              <CardDescription>
                Set up your brand identity to ensure AI generates consistent, on-brand content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    placeholder="Your Brand"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://yourbrand.com"
                      className="pl-9"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="instagram"
                      placeholder="@handle"
                      className="pl-9"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="twitter"
                      placeholder="@handle"
                      className="pl-9"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      placeholder="company-name"
                      className="pl-9"
                      value={linkedinHandle}
                      onChange={(e) => setLinkedinHandle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="facebook"
                      placeholder="page-name"
                      className="pl-9"
                      value={facebookHandle}
                      onChange={(e) => setFacebookHandle(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Brand Voice (select up to 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {voiceOptions.map((voice) => (
                    <Badge
                      key={voice}
                      variant={selectedVoice.includes(voice) ? 'default' : 'outline'}
                      className="cursor-pointer transition-smooth"
                      onClick={() => toggleVoice(voice)}
                    >
                      {voice}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">Brand Mission</Label>
                <Textarea
                  id="mission"
                  placeholder="What does your brand stand for? What's your mission and core values?"
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBrand} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Brand'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Brands */}
        {brands.length === 0 && !showForm ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No brands yet</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Create your first brand to start generating on-brand content
              </p>
              <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Brand
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Card key={brand.id} className="transition-smooth hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: brand.primary_color }}
                    >
                      <Palette className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{brand.name}</h3>
                      {brand.website_url && (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {brand.website_url}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {brand.voice_characteristics.map((voice) => (
                          <Badge key={voice} variant="secondary" className="text-xs">
                            {voice}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

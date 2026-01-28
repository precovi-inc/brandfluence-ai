import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ImagePlus, Sparkles, Upload, X, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageGallery({ images, onImagesChange, maxImages = 10 }: ImageGalleryProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('content-media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('content-media')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
        toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await supabase.functions.invoke('generate-content-image', {
        body: { prompt: aiPrompt },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate image');
      }

      const { imageUrl } = response.data;
      if (imageUrl) {
        onImagesChange([...images, imageUrl]);
        toast.success('Image generated successfully');
        setAiPrompt('');
        setAiDialogOpen(false);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    selectedImages.delete(index);
    setSelectedImages(new Set(selectedImages));
  };

  const toggleSelectImage = (index: number) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedImages(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Media Gallery</Label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUploading || images.length >= maxImages}
          asChild
        >
          <label className="cursor-pointer">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
            <Input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </Button>

        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={images.length >= maxImages}
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Image with AI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Describe the image you want</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="e.g., A modern office workspace with natural lighting, minimalist design, plants on the desk..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <Card
              key={index}
              className={cn(
                'group relative overflow-hidden cursor-pointer transition-all',
                selectedImages.has(index) && 'ring-2 ring-primary'
              )}
              onClick={() => toggleSelectImage(index)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'absolute top-2 left-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedImages.has(index)
                        ? 'bg-primary border-primary'
                        : 'bg-background/80 border-muted-foreground/50'
                    )}
                  >
                    {selectedImages.has(index) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add more placeholder */}
          {images.length < maxImages && (
            <label className="cursor-pointer">
              <Card className="border-dashed hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Add more</span>
                  </div>
                </CardContent>
              </Card>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">No images yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload images or generate with AI
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

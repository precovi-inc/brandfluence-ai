import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBrandGuidelines } from '@/hooks/useBrandGuidelines';
import { Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BrandGuidelinesUploadProps {
  brandId: string;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  doc: 'Word',
  docx: 'Word',
  txt: 'Text',
  md: 'Markdown',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  webp: 'Image',
};

export function BrandGuidelinesUpload({ brandId }: BrandGuidelinesUploadProps) {
  const { guidelines, isLoading, uploadGuideline, deleteGuideline, isUploading, isDeleting } =
    useBrandGuidelines(brandId);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewingGuideline, setViewingGuideline] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [brandId]
  );

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 20MB`);
        return;
      }

      uploadGuideline(
        { file, brandId },
        {
          onSuccess: () => {
            toast.success(`${file.name} uploaded and analyzed!`);
          },
          onError: (error) => {
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
          },
        }
      );
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDelete = (id: string, fileName: string) => {
    deleteGuideline(id, {
      onSuccess: () => toast.success(`${fileName} deleted`),
      onError: () => toast.error('Failed to delete file'),
    });
  };

  const selectedGuideline = guidelines.find((g) => g.id === viewingGuideline);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Brand Guidelines
          </CardTitle>
          <CardDescription>
            Upload your brand guidelines documents. AI will analyze them to ensure consistent content
            generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading and analyzing...</p>
                <Progress value={66} className="mx-auto max-w-xs" />
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{' '}
                  <label className="cursor-pointer text-primary hover:underline">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
                      multiple
                      onChange={handleFileInput}
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, Word, Text, Markdown, or Images up to 20MB
                </p>
              </>
            )}
          </div>

          {/* Guidelines List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : guidelines.length > 0 ? (
            <div className="space-y-2">
              {guidelines.map((guideline) => (
                <div
                  key={guideline.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{guideline.file_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {FILE_TYPE_LABELS[guideline.file_type] || guideline.file_type.toUpperCase()}
                        </Badge>
                        {guideline.parsed_content ? (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <CheckCircle className="h-3 w-3" />
                            Analyzed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <AlertCircle className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {guideline.parsed_content && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingGuideline(guideline.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(guideline.id, guideline.file_name)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No guidelines uploaded yet. Upload your brand documents to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* View Parsed Content Dialog */}
      <Dialog open={!!viewingGuideline} onOpenChange={() => setViewingGuideline(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Extracted Brand Guidelines</DialogTitle>
            <DialogDescription>{selectedGuideline?.file_name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {selectedGuideline?.parsed_content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

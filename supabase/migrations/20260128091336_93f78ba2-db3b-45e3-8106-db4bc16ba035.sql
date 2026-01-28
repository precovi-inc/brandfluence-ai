-- Create content-media storage bucket for user uploads and AI generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-media', 'content-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload content media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to content media
CREATE POLICY "Public can view content media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-media');

-- Allow users to delete their own content media
CREATE POLICY "Users can delete own content media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-media' AND (storage.foldername(name))[1] = auth.uid()::text);
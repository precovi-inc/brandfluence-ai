-- Create storage bucket for brand guidelines
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('brand-guidelines', 'brand-guidelines', false, 20971520);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload brand guidelines"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own files
CREATE POLICY "Users can read own brand guidelines"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'brand-guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own brand guidelines"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
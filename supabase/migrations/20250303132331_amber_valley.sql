/*
  # Create storage bucket for product images

  1. New Storage Bucket
    - `images` bucket for storing product images
  
  2. Security
    - Enable public access for images
    - Add policies for authenticated users to upload images
*/

-- Create a bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images
CREATE POLICY "Public Access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update their own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid());

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete their own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid());
import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImageUrls?: string[];
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ onImagesUploaded, currentImageUrls = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImageUrls);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(Array.from(e.target.files));
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} не является изображением`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} превышает размер 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setPreviews(prev => [...prev, objectUrl]);

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Update parent component with new URLs
      onImagesUploaded([...previews, ...uploadedUrls]);
      toast.success('Изображения успешно загружены');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error('Ошибка при загрузке изображений');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    onImagesUploaded(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm text-gray-500">Загрузка изображений...</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center mb-2">
              Перетащите изображения сюда или нажмите для выбора
            </p>
            <p className="text-xs text-gray-400 text-center">
              PNG, JPG, GIF до 5MB
            </p>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
          </>
        )}
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onError={() => {
                  handleRemoveImage(index);
                  toast.error('Не удалось загрузить изображение');
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                aria-label="Удалить изображение"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
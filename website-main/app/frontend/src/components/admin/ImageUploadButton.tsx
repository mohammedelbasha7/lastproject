import { ChangeEvent, useRef, useState } from 'react';
import { ImageUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadAdminImage } from '@/lib/api';

interface ImageUploadButtonProps {
  onUploaded: (url: string) => void;
  size?: 'default' | 'sm';
}

export default function ImageUploadButton({ onUploaded, size = 'default' }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    setUploading(true);
    const url = await uploadAdminImage(file);
    setUploading(false);

    if (!url) {
      toast.error('Image upload failed');
      return;
    }

    onUploaded(url);
    toast.success('Image uploaded');
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <ImageUp className="w-4 h-4 ml-2" />
        {uploading ? 'Uploading...' : 'Upload image'}
      </Button>
    </>
  );
}

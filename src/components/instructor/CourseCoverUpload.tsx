
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fileAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Image, Loader2 } from "lucide-react";

interface CourseCoverUploadProps {
  onImageUploaded: (fileId: string) => void;
  initialImageId?: string;
}

export default function CourseCoverUpload({ 
  onImageUploaded, 
  initialImageId 
}: CourseCoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch initial image if available
  useState(() => {
    const fetchImage = async () => {
      if (initialImageId) {
        try {
          const response = await fileAPI.getFileById(initialImageId);
          if (response.data?.data?.file?.path) {
            setPreviewUrl(response.data.data.file.path);
          }
        } catch (error) {
          console.error("Error fetching initial image:", error);
        }
      }
    };

    fetchImage();
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, JPEG, GIF)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should not exceed 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload the file
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fileAPI.uploadFile(formData);
      const fileId = response.data.data.file._id;
      
      onImageUploaded(fileId);
      
      toast({
        title: "Upload successful",
        description: "Your course cover image has been uploaded",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
      // Clear preview on error
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Course Cover Image
      </label>
      
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Course cover preview" 
            className="w-full h-48 object-cover rounded-md border border-gray-200"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2 bg-white"
            onClick={() => document.getElementById('coverImage')?.click()}
          >
            Change Image
          </Button>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center h-48 border-dashed border-2 border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => document.getElementById('coverImage')?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center p-6">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center p-6">
              <Image className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to upload course cover image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
        </Card>
      )}

      <Input 
        id="coverImage"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}

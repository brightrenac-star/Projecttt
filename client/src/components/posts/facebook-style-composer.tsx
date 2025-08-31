import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  DollarSign, 
  Users, 
  Globe, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  X,
  Upload,
  AlertCircle
} from "lucide-react";

interface FacebookStyleComposerProps {
  creatorId: string;
  onPostCreated?: () => void;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

export function FacebookStyleComposer({ creatorId, onPostCreated }: FacebookStyleComposerProps) {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [visibility, setVisibility] = useState<"public" | "members" | "ppv">("public");
  const [price, setPrice] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadProgress(20);
      const response = await fetch("/api/posts/upload", {
        method: "POST",
        body: formData,
      });
      setUploadProgress(80);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create post");
      }
      
      setUploadProgress(100);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setMediaFiles([]);
      setPrice("");
      setVisibility("public");
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId, "posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully."
      });
      onPostCreated?.();
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: MediaFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported media file. Only images and videos are allowed.`,
          variant: "destructive"
        });
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 25MB. Please choose a smaller file.`,
          variant: "destructive"
        });
        continue;
      }

      // Check total files limit
      if (mediaFiles.length + newFiles.length >= MAX_FILES) {
        toast({
          title: "Too many files",
          description: `You can only upload up to ${MAX_FILES} files per post.`,
          variant: "destructive"
        });
        break;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({
        file,
        preview,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      });
    }

    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Content required",
        description: "Please enter some text or add at least one media file.",
        variant: "destructive"
      });
      return;
    }

    if (visibility === "ppv" && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Price required",
        description: "Please enter a valid price for pay-per-view content.",
        variant: "destructive"
      });
      return;
    }

    // Create FormData for multipart submission
    const formData = new FormData();
    formData.append("creatorId", creatorId);
    formData.append("content", content.trim());
    formData.append("visibility", visibility);
    
    if (visibility === "ppv") {
      formData.append("price", price);
    }

    // Add media files
    mediaFiles.forEach((mediaFile, index) => {
      formData.append(`media`, mediaFile.file);
    });

    createPostMutation.mutate(formData);
  };

  const isSubmitDisabled = createPostMutation.isPending || (!content.trim() && mediaFiles.length === 0);

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public": return <Globe className="w-4 h-4" />;
      case "members": return <Users className="w-4 h-4" />;
      case "ppv": return <DollarSign className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Card className="glass-strong border-border mb-6" data-testid="facebook-style-composer">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Large Text Area */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share something with your audience..."
              className="min-h-[140px] sm:min-h-[160px] bg-input/80 border-border resize-none text-base leading-relaxed"
              data-testid="textarea-composer-content"
              aria-label="Post content"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{content.length}/2000 characters</span>
              {content.length > 1800 && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Character limit approaching
                </Badge>
              )}
            </div>
          </div>

          {/* Media Upload Area */}
          <div className="space-y-3">
            {/* Upload Progress */}
            {createPostMutation.isPending && uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* File Upload Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-muted/20 hover:bg-muted/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="media-upload-zone"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drag and drop media files here, or click to select
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="glass border-border"
                  data-testid="button-attach-media"
                  aria-label="Attach media files"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Images and videos only • Max {MAX_FILES} files • 25MB each
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                aria-label="Upload media files"
              />
            </div>

            {/* Media Previews */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {mediaFiles.map((mediaFile, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
                    data-testid={`media-preview-${index}`}
                  >
                    {mediaFile.type === 'image' ? (
                      <>
                        <img
                          src={mediaFile.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1">
                          <Badge variant="secondary" className="text-xs">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            IMG
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <video
                          src={mediaFile.preview}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute top-1 left-1">
                          <Badge variant="secondary" className="text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            VID
                          </Badge>
                        </div>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-media-${index}`}
                      aria-label={`Remove media file ${index + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="absolute bottom-1 right-1">
                      <Badge variant="outline" className="text-xs bg-black/70 text-white border-white/20">
                        {(mediaFile.file.size / (1024 * 1024)).toFixed(1)}MB
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-border">
            {/* Visibility Selector */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-foreground">Visibility</Label>
              <Select value={visibility} onValueChange={(value: "public" | "members" | "ppv") => setVisibility(value)}>
                <SelectTrigger className="bg-input/80 border-border h-10" data-testid="select-composer-visibility">
                  <div className="flex items-center space-x-2">
                    {getVisibilityIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-strong border-border">
                  <SelectItem value="public" data-testid="composer-visibility-public">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="members" data-testid="composer-visibility-members">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Subscribers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ppv" data-testid="composer-visibility-ppv">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Pay to Unlock</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Input for Pay-per-view */}
            {visibility === "ppv" && (
              <div className="flex-1 space-y-2">
                <Label htmlFor="composer-price" className="text-sm font-medium text-foreground">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="composer-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 bg-input/80 border-border h-10"
                    data-testid="input-composer-price"
                    aria-label="Pay-per-view price"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-end">
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground h-10 px-6 min-w-[100px]"
                disabled={isSubmitDisabled}
                data-testid="button-composer-post"
              >
                {createPostMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
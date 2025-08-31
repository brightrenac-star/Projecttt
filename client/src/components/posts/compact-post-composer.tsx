import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, VideoIcon, X, Plus, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactPostComposerProps {
  creatorId: string;
  onPostCreated: () => void;
}

export function CompactPostComposer({ creatorId, onPostCreated }: CompactPostComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [price, setPrice] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/posts/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessages: Record<number, string> = {
          401: "Please sign in and try again.",
          415: "Use FormData for media uploads; do not set Content-Type manually.",
          413: "Your file exceeds the size limit.",
          400: "Visibility is required. Add a price for Pay to Unlock.",
        };
        
        const message = errorData.message || statusMessages[response.status] || "We couldn't reach the server. Check your API URL/CORS.";
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with your audience.",
      });
      
      // Reset form
      setContent("");
      setVisibility("public");
      setPrice("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      setIsExpanded(false);
      
      // Refresh feed
      onPostCreated();
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId, "posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = selectedFiles.length + newFiles.length;

    if (totalFiles > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 files per post.",
        variant: "destructive",
      });
      return;
    }

    // Validate file types and size
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of newFiles) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image or video file.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 25MB size limit.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some text or media to your post.",
        variant: "destructive",
      });
      return;
    }

    if (visibility === "ppv" && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Price required",
        description: "Please set a valid price for pay-per-view content.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    if (visibility === "ppv") {
      formData.append("price", price);
    }
    selectedFiles.forEach((file) => {
      formData.append("media", file);
    });

    createPostMutation.mutate(formData);
  };

  const canPost = (content.trim() || selectedFiles.length > 0) && (visibility !== "ppv" || (price && parseFloat(price) > 0));

  if (!isExpanded) {
    return (
      <Card className="glass mb-6" data-testid="compact-composer-bar">
        <CardContent className="p-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-left px-4 py-3 bg-background/50 hover:bg-background/70 rounded-lg border border-border/50 transition-colors text-muted-foreground"
            data-testid="button-expand-composer"
          >
            What's on your mind? Share with your supporters...
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass mb-6" data-testid="expanded-composer">
      <CardContent className="p-6 space-y-4">
        {/* Text Content */}
        <div>
          <Textarea
            placeholder="What's on your mind? Share your thoughts with your supporters..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none bg-background/50 border-border/50"
            data-testid="input-post-content"
          />
        </div>

        {/* Media Previews */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {previewUrls.map((url, index) => {
              const file = selectedFiles[index];
              const isVideo = file?.type.startsWith('video/');
              
              return (
                <div key={index} className="relative group">
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                      data-testid={`preview-video-${index}`}
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      data-testid={`preview-image-${index}`}
                    />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 left-2 text-xs"
                    data-testid={`badge-file-type-${index}`}
                  >
                    {isVideo ? <VideoIcon className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                    {isVideo ? 'Video' : 'Image'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/50">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedFiles.length >= 5}
              className="gap-2"
              data-testid="button-add-media"
            >
              <Plus className="h-4 w-4" />
              Add Media ({selectedFiles.length}/5)
            </Button>
          </div>

          {/* Visibility Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Visibility:</span>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-40" data-testid="select-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="members">Subscribers</SelectItem>
                <SelectItem value="ppv">Pay to Unlock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Input for PPV */}
          {visibility === "ppv" && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-24"
                min="0"
                step="0.01"
                data-testid="input-price"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setContent("");
                setVisibility("public");
                setPrice("");
                setSelectedFiles([]);
                previewUrls.forEach(url => URL.revokeObjectURL(url));
                setPreviewUrls([]);
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canPost || createPostMutation.isPending}
              className="gap-2"
              data-testid="button-post"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, DollarSign, Users, Globe } from "lucide-react";

interface InlinePostComposerProps {
  creatorId: string;
  onPostCreated?: () => void;
}

export function InlinePostComposer({ creatorId, onPostCreated }: InlinePostComposerProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "members" | "ppv">("public");
  const [price, setPrice] = useState("");
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      creatorId: string;
      content: string;
      mediaUrl?: string;
      visibility: string;
      price?: number;
    }) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setMediaUrl("");
      setPrice("");
      setVisibility("public");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId, "posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully."
      });
      onPostCreated?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
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

    const postData = {
      creatorId,
      content: content.trim(),
      mediaUrl: mediaUrl.trim() || undefined,
      visibility,
      price: visibility === "ppv" ? parseFloat(price) : undefined
    };

    createPostMutation.mutate(postData);
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public": return <Globe className="w-4 h-4" />;
      case "members": return <Users className="w-4 h-4" />;
      case "ppv": return <DollarSign className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case "public": return "Everyone can see this";
      case "members": return "Only subscribers can see this";
      case "ppv": return "Pay-per-view content";
      default: return "Public";
    }
  };

  return (
    <Card className="glass-strong border-border mb-6" data-testid="inline-post-composer">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Visibility Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">Post Visibility</Label>
            <Select value={visibility} onValueChange={(value: "public" | "members" | "ppv") => setVisibility(value)}>
              <SelectTrigger className="bg-input/80 border-border" data-testid="select-visibility">
                <div className="flex items-center space-x-2">
                  {getVisibilityIcon()}
                  <SelectValue placeholder="Select visibility" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass-strong border-border">
                <SelectItem value="public" data-testid="visibility-public">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">Everyone can see this</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="members" data-testid="visibility-members">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Subscribers Only</div>
                      <div className="text-xs text-muted-foreground">Only your subscribers can see this</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="ppv" data-testid="visibility-ppv">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Pay to Unlock</div>
                      <div className="text-xs text-muted-foreground">Users pay once to access this content</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{getVisibilityLabel()}</p>
          </div>

          {/* Price Input for Pay-per-view */}
          {visibility === "ppv" && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 bg-input/80 border-border"
                  data-testid="input-price"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set a one-time unlock price for this content
              </p>
            </div>
          )}

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-foreground">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with your audience... (Markdown supported)"
              className="min-h-[120px] bg-input/80 border-border resize-none"
              data-testid="textarea-content"
            />
            <div className="text-xs text-muted-foreground">
              {content.length}/2000 characters
            </div>
          </div>

          {/* Media URL Input */}
          <div className="space-y-2">
            <Label htmlFor="mediaUrl" className="text-foreground">Image URL (optional)</Label>
            <Input
              id="mediaUrl"
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-input/80 border-border"
              data-testid="input-media-url"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setContent("");
                setMediaUrl("");
                setPrice("");
                setVisibility("public");
              }}
              className="glass border-border"
              data-testid="button-clear"
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground"
              disabled={createPostMutation.isPending || !content.trim()}
              data-testid="button-post"
            >
              <Send className="w-4 h-4 mr-2" />
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
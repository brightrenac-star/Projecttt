import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnlockButton } from "@/components/wallet/unlock-button";
import { SubscribeButton } from "@/components/wallet/subscribe-button";
import { Lock, Users, DollarSign } from "lucide-react";

interface LockedPostPreviewProps {
  post: {
    id: string;
    title?: string;
    content?: string;
    visibility: "public" | "members" | "ppv";
    price?: number;
    mediaUrl?: string;
    createdAt: string | Date;
    editedAt?: string | Date;
    isLocked?: boolean;
  };
  creator: {
    id: string;
    name: string;
    handle: string;
  };
  userSubscribed?: boolean;
  onUnlocked?: () => void;
}

export function LockedPostPreview({ 
  post, 
  creator, 
  userSubscribed = false, 
  onUnlocked 
}: LockedPostPreviewProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!post.isLocked || isUnlocked) {
    // Show full post content
    return (
      <Card className="glass border-border mb-4" data-testid="full-post">
        <CardContent className="p-6">
          {post.mediaUrl && (
            <div className="mb-4">
              <img 
                src={post.mediaUrl} 
                alt="Post media" 
                className="w-full rounded-lg max-h-96 object-cover"
              />
            </div>
          )}
          <div className="prose prose-sm max-w-none text-foreground">
            {post.content?.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()} at{' '}
                {new Date(post.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {post.editedAt && (
                  <> • Edited {new Date(post.editedAt).toLocaleDateString()}</>
                )}
              </span>
              {post.editedAt && (
                <Badge variant="outline" className="text-xs" data-testid="badge-post-edited">
                  Edited
                </Badge>
              )}
            </div>
            {post.visibility !== "public" && (
              <Badge variant="outline" className="text-xs">
                {post.visibility === "members" ? "Subscribers Only" : `$${post.price} Unlock`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show locked preview
  const getPreviewText = () => {
    if (!post.content) return "Exclusive content available...";
    // Show first 100 characters as preview
    const preview = post.content.substring(0, 100);
    return preview.length < post.content.length ? `${preview}...` : preview;
  };

  const getLockIcon = () => {
    switch (post.visibility) {
      case "members": return <Users className="w-5 h-5" />;
      case "ppv": return <DollarSign className="w-5 h-5" />;
      default: return <Lock className="w-5 h-5" />;
    }
  };

  const getLockTitle = () => {
    switch (post.visibility) {
      case "members": return "Subscribers Only";
      case "ppv": return `Unlock for $${post.price}`;
      default: return "Locked Content";
    }
  };

  const getLockDescription = () => {
    switch (post.visibility) {
      case "members": return `Subscribe to ${creator.name} to access this exclusive content`;
      case "ppv": return "Pay once to unlock this content permanently";
      default: return "This content is restricted";
    }
  };

  return (
    <Card className="glass border-border mb-4 relative overflow-hidden" data-testid="locked-post-preview">
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 z-10 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/30 flex items-center justify-center">
            {getLockIcon()}
          </div>
          <h3 className="text-lg font-semibold mb-2">{getLockTitle()}</h3>
          <p className="text-sm opacity-90 mb-4">{getLockDescription()}</p>
          
          {post.visibility === "members" && !userSubscribed && (
            <SubscribeButton
              creatorId={creator.id}
              creatorName={creator.name}
              className="bg-white text-black hover:bg-gray-100"
            />
          )}
          
          {post.visibility === "ppv" && (
            <UnlockButton
              postId={post.id}
              price={post.price || 0}
              postTitle={post.title || "this content"}
              className="bg-amber-500 text-white hover:bg-amber-600"
              onUnlocked={() => {
                setIsUnlocked(true);
                onUnlocked?.();
              }}
            />
          )}
        </div>
      </div>

      <CardContent className="p-6 filter blur-sm">
        {post.mediaUrl && (
          <div className="mb-4">
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-foreground">{getPreviewText()}</p>
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <Badge variant="outline" className="text-xs">
            {post.visibility === "members" ? "Subscribers Only" : `$${post.price} to Unlock`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { MoreVertical, Edit3, Trash2, Users, DollarSign, Heart, MessageCircle, ThumbsUp } from "lucide-react";
import { UnlockButton } from "@/components/wallet/unlock-button";
import { SubscribeButton } from "@/components/wallet/subscribe-button";
import { TipButton } from "@/components/wallet/tip-button";
import CommentsSection from "@/components/comments/comments-section";

const editPostSchema = z.object({
  title: z.string().max(200, "Title must be under 200 characters").optional(),
  content: z.string().min(1, "Content is required").max(2000, "Content must be under 2000 characters"),
});

export interface PostCardProps {
  post: {
    id: string;
    title?: string;
    content?: string;
    visibility: "public" | "members" | "ppv";
    price?: number;
    mediaUrl?: string;
    createdAt: string | Date;
    editedAt?: string | Date;
    likes?: number;
    isLocked?: boolean;
  };
  creator: {
    id: string;
    userId?: string;
    name: string;
    handle: string;
    avatar?: string;
  };
  userSubscribed?: boolean;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
  showComments?: boolean;
  className?: string;
}

export default function PostCard({ 
  post, 
  creator, 
  userSubscribed = false,
  onPostUpdated,
  onPostDeleted,
  showComments = true,
  className = ""
}: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  // Check if current user owns this post
  const isOwner = user && (user.id === creator.userId);

  // Edit form
  const editForm = useForm({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: post.title || "",
      content: post.content || "",
    },
  });

  // Edit post mutation
  const editMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editPostSchema>) => {
      const response = await apiRequest("PATCH", `/api/posts/${post.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Post updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creator.id, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setShowEditDialog(false);
      onPostUpdated?.();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update post", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/posts/${post.id}`);
      return response.ok;
    },
    onSuccess: () => {
      toast({ title: "Post deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creator.id, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setShowDeleteDialog(false);
      onPostDeleted?.();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete post", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/like`);
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creator.id, "posts"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update like", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (data: z.infer<typeof editPostSchema>) => {
    editMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  // Determine if post should be locked
  const shouldShowLocked = post.isLocked || (
    (post.visibility === "members" && !userSubscribed) ||
    (post.visibility === "ppv" && !isUnlocked)
  );

  // Show locked preview for non-public content
  if (shouldShowLocked && !isOwner) {
    return (
      <Card className={`glass border-border mb-4 relative overflow-hidden ${className}`} data-testid="locked-post-preview">
        {/* Lock overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 z-10 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/30 flex items-center justify-center">
              {post.visibility === "members" ? <Users className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {post.visibility === "members" ? "Subscribers Only" : `Unlock for $${post.price}`}
            </h3>
            <p className="text-sm opacity-90 mb-4">
              {post.visibility === "members" 
                ? `Subscribe to ${creator.name} to access this exclusive content`
                : "Pay once to unlock this content permanently"
              }
            </p>
            
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
                onUnlocked={() => setIsUnlocked(true)}
              />
            )}
          </div>
        </div>

        <CardContent className="p-6 filter blur-sm">
          {post.mediaUrl && (
            <div className="mb-4">
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-foreground">
              {post.content?.substring(0, 100)}{post.content && post.content.length > 100 ? '...' : ''}
            </p>
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show full post content
  return (
    <>
      <Card className={`glass border-border mb-4 ${className}`} data-testid="post-card">
        <CardContent className="p-6">
          {/* Creator info and actions header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {creator.avatar ? (
                <img 
                  src={creator.avatar} 
                  alt={`${creator.name} avatar`} 
                  className="w-10 h-10 rounded-full object-cover"
                  data-testid="creator-avatar"
                />
              ) : (
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-foreground" data-testid="creator-name">
                  {creator.name}
                </h4>
                <p className="text-sm text-muted-foreground">@{creator.handle}</p>
              </div>
            </div>

            {/* Post actions menu for owner */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-11 w-11 p-0" data-testid="button-post-menu">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)} data-testid="menu-edit-post">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                    data-testid="menu-delete-post"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post title */}
          {post.title && (
            <h3 className="text-lg font-semibold text-foreground mb-3" data-testid="post-title">
              {post.title}
            </h3>
          )}

          {/* Post media */}
          {post.mediaUrl && (
            <div className="mb-4">
              <img 
                src={post.mediaUrl} 
                alt="Post media" 
                className="w-full rounded-lg max-h-96 object-cover"
                data-testid="post-media"
              />
            </div>
          )}

          {/* Post content */}
          {post.content && (
            <div className="prose prose-sm max-w-none text-foreground mb-4" data-testid="post-content">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
              ))}
            </div>
          )}

          {/* Post footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              {/* Timestamp and edited badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground" data-testid="post-timestamp">
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

              {/* Visibility badge */}
              {post.visibility !== "public" && (
                <Badge variant="outline" className="text-xs" data-testid="badge-post-visibility">
                  {post.visibility === "members" ? "Subscribers Only" : `$${post.price} Unlock`}
                </Badge>
              )}
            </div>

            {/* Post actions */}
            <div className="flex items-center gap-2">
              {/* Like button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`h-11 px-3 transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-red-500'
                }`}
                data-testid="button-like-post"
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likeCount}</span>
              </Button>

              {/* Comments button toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-11 px-3 text-muted-foreground hover:text-foreground transition-all duration-200"
                data-testid="button-toggle-comments"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Comment</span>
              </Button>

              {/* Tip button for non-owners */}
              {!isOwner && (
                <TipButton
                  creatorId={creator.id}
                  postId={post.id}
                  creatorName={creator.name}
                  size="sm"
                  variant="outline"
                  className="h-11"
                />
              )}
            </div>
          </div>

          {/* Comments section - integrated within the card */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-border">
              <CommentsSection 
                postId={post.id} 
                creatorId={creator.id}
                className=""
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Post title..." data-testid="input-edit-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="What's on your mind?"
                        rows={6}
                        data-testid="textarea-edit-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editMutation.isPending}
                  className="gradient-primary text-primary-foreground"
                  data-testid="button-save-edit"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and all comments will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
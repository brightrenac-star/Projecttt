import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { MessageCircle, MoreVertical, Eye, EyeOff, Trash2, Flag, Send } from "lucide-react";
import type { Comment } from "@shared/schema";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
});

interface CommentsSectionProps {
  postId: string;
  creatorId: string;
  className?: string;
}

interface CommentItemProps {
  comment: Comment & { user: { name: string; avatar?: string } };
  isCreator: boolean;
  onModerationAction: (commentId: string, action: 'hide' | 'delete') => void;
}

function CommentItem({ comment, isCreator, onModerationAction }: CommentItemProps) {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);

  const isOwner = user?.id === comment.userId;
  const canModerate = isCreator || isOwner;

  if (comment.isHidden && !isCreator) {
    return null; // Hidden comments only visible to creator
  }

  return (
    <>
      <div className="flex gap-3 p-4 border-b border-border last:border-0" data-testid={`comment-${comment.id}`}>
        <div className="flex-shrink-0">
          {comment.user.avatar ? (
            <img 
              src={comment.user.avatar} 
              alt={`${comment.user.name} avatar`} 
              className="w-8 h-8 rounded-full object-cover"
              data-testid="comment-avatar"
            />
          ) : (
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground" data-testid="comment-author">
              {comment.user.name}
            </span>
            <span className="text-xs text-muted-foreground" data-testid="comment-date">
              {comment.createdAt ? (
                <>
                  {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                  {new Date(comment.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </>
              ) : (
                "Recently"
              )}
            </span>
            {comment.isHidden && isCreator && (
              <Badge variant="outline" className="text-xs" data-testid="badge-hidden">
                Hidden
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-foreground mb-2" data-testid="comment-content">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-2">
            {/* Reply button could be added here for nested comments */}
            {canModerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" data-testid={`button-comment-menu-${comment.id}`}>
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isCreator && !comment.isHidden && (
                    <DropdownMenuItem onClick={() => setShowHideDialog(true)} data-testid="menu-hide-comment">
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Comment
                    </DropdownMenuItem>
                  )}
                  {isCreator && comment.isHidden && (
                    <DropdownMenuItem 
                      onClick={() => onModerationAction(comment.id, 'hide')}
                      data-testid="menu-unhide-comment"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Unhide Comment
                    </DropdownMenuItem>
                  )}
                  {(isCreator || isOwner) && (
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                      data-testid="menu-delete-comment"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Comment
                    </DropdownMenuItem>
                  )}
                  {!isOwner && !isCreator && (
                    <DropdownMenuItem data-testid="menu-report-comment">
                      <Flag className="h-4 w-4 mr-2" />
                      Report Comment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onModerationAction(comment.id, 'delete');
                setShowDeleteDialog(false);
              }}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hide Confirmation Dialog */}
      <AlertDialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide Comment</AlertDialogTitle>
            <AlertDialogDescription>
              This comment will be hidden from other users but you will still be able to see it. 
              You can unhide it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-hide">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onModerationAction(comment.id, 'hide');
                setShowHideDialog(false);
              }}
              data-testid="button-confirm-hide"
            >
              Hide Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function CommentsSection({ postId, creatorId, className }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  // Fetch comments for the post
  const { data: comments = [], isLoading } = useQuery<(Comment & { user: { name: string; avatar?: string } })[]>({
    queryKey: ["/api/posts", postId, "comments"],
    enabled: !!postId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof commentSchema>) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/comments`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      form.reset();
      toast({ title: "Comment added successfully!" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to add comment", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Moderation mutation (hide/unhide/delete)
  const moderationMutation = useMutation({
    mutationFn: async ({ commentId, action }: { commentId: string; action: 'hide' | 'delete' }) => {
      if (action === 'delete') {
        const response = await apiRequest("DELETE", `/api/comments/${commentId}`);
        return response.ok;
      } else {
        // Toggle hide status
        const comment = comments.find(c => c.id === commentId);
        const response = await apiRequest("PATCH", `/api/comments/${commentId}`, {
          isHidden: !comment?.isHidden
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      toast({ title: "Comment moderated successfully!" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Moderation failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleModerationAction = (commentId: string, action: 'hide' | 'delete') => {
    moderationMutation.mutate({ commentId, action });
  };

  const onSubmit = (data: z.infer<typeof commentSchema>) => {
    if (!user) {
      toast({ 
        title: "Please log in", 
        description: "You need to be logged in to comment.", 
        variant: "destructive" 
      });
      return;
    }
    addCommentMutation.mutate(data);
  };

  const isCreator = user?.id === creatorId;
  const visibleComments = comments.filter(comment => !comment.isHidden || isCreator);

  return (
    <Card className={`glass ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({visibleComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        {user ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write a comment..."
                        rows={3}
                        disabled={addCommentMutation.isPending}
                        data-testid="textarea-comment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={addCommentMutation.isPending || !form.watch("content").trim()}
                  className="gradient-primary text-primary-foreground"
                  data-testid="button-submit-comment"
                >
                  {addCommentMutation.isPending ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="text-center p-4 border border-border rounded-lg">
            <p className="text-muted-foreground mb-2">Please log in to join the conversation</p>
            <Button variant="outline" size="sm" data-testid="button-login-to-comment">
              Log In to Comment
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleComments.length === 0 ? (
            <div className="text-center p-8" data-testid="no-comments">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
            </div>
          ) : (
            visibleComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isCreator={isCreator}
                onModerationAction={handleModerationAction}
              />
            ))
          )}
        </div>

        {/* Show hidden comments count for creators */}
        {isCreator && comments.length > visibleComments.length && (
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {comments.length - visibleComments.length} hidden comment(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
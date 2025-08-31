import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import Navigation from "../components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Users, BarChart3, Settings, Plus, Trash2, DollarSign, Heart, TrendingUp } from "lucide-react";
import type { Creator, Post } from "@shared/schema";

export default function StudioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Get creator profile
  const { data: creator } = useQuery<Creator>({
    queryKey: ["/api/creators", user?.id],
    enabled: !!user?.id,
  });

  // Get creator posts
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/creators", creator?.id, "posts"],
    enabled: !!creator?.id,
  });

  // Get analytics
  const { data: analytics } = useQuery<{ 
    totalRevenue: number;
    monthlyRevenue: number;
    subscriberCount: number;
    recentTips: number;
    totalPosts: number;
    totalLikes: number;
    tips: any[];
  }>({
    queryKey: ["/api/creators", creator?.id, "analytics"],
    enabled: !!creator?.id,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creator?.id, "posts"] });
      setShowPostForm(false);
      setEditingPost(null);
      toast({ title: "Post created successfully!" });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creator?.id, "posts"] });
      setShowPostForm(false);
      setEditingPost(null);
      toast({ title: "Post updated successfully!" });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creator?.id, "posts"] });
      toast({ title: "Post deleted successfully!" });
    },
  });

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const postData = {
      title: formData.get("title"),
      content: formData.get("content"),
      visibility: formData.get("visibility"),
      price: formData.get("price") ? parseInt(formData.get("price") as string) * 100 : 0, // Convert to cents
      tier: formData.get("tier"),
    };

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data: postData });
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleDelete = (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  if (!creator) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="glass-strong">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Create Your Studio</h2>
              <p className="text-muted-foreground mb-6">You need to set up your creator profile first.</p>
              <Link href="/profile">
                <Button className="gradient-primary text-primary-foreground" data-testid="button-setup-creator">
                  Set Up Creator Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className="w-64 glass-strong border-r border-border">
          <div className="p-6">
            <h1 className="text-xl font-bold text-foreground mb-6">Creator Studio</h1>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center px-4 py-2 rounded-lg w-full text-left transition-smooth ${
                  activeTab === "posts" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="tab-posts"
              >
                <Edit className="mr-3 h-4 w-4" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center px-4 py-2 rounded-lg w-full text-left transition-smooth ${
                  activeTab === "analytics" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="tab-analytics"
              >
                <BarChart3 className="mr-3 h-4 w-4" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`flex items-center px-4 py-2 rounded-lg w-full text-left transition-smooth ${
                  activeTab === "members" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="tab-members"
              >
                <Users className="mr-3 h-4 w-4" />
                Members
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center px-4 py-2 rounded-lg w-full text-left transition-smooth ${
                  activeTab === "settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="tab-settings"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Posts</h2>
                  <Button
                    onClick={() => {
                      setEditingPost(null);
                      setShowPostForm(true);
                    }}
                    className="gradient-primary text-primary-foreground hover-scale transition-smooth"
                    data-testid="button-new-post"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </div>

                {/* Post Form */}
                {showPostForm && (
                  <Card className="glass mb-8">
                    <CardHeader>
                      <CardTitle>{editingPost ? "Edit Post" : "Create New Post"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePostSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            name="title"
                            defaultValue={editingPost?.title || ""}
                            placeholder="Post title..."
                            required
                            data-testid="input-post-title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            name="content"
                            defaultValue={editingPost?.content || ""}
                            placeholder="What do you want to share with your supporters?"
                            rows={4}
                            data-testid="textarea-post-content"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="visibility">Visibility</Label>
                            <Select name="visibility" defaultValue={editingPost?.visibility || "public"}>
                              <SelectTrigger data-testid="select-visibility">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="members">Members Only</SelectItem>
                                <SelectItem value="ppv">Pay Per View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="price">Price (SUI)</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={editingPost?.price ? editingPost.price / 100 : ""}
                              placeholder="0.00"
                              data-testid="input-post-price"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tier">Tier (for members)</Label>
                            <Input
                              id="tier"
                              name="tier"
                              defaultValue={editingPost?.tier || ""}
                              placeholder="Premium, Basic, etc."
                              data-testid="input-post-tier"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPostForm(false)}
                            data-testid="button-cancel-post"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="gradient-primary text-primary-foreground"
                            disabled={createPostMutation.isPending || updatePostMutation.isPending}
                            data-testid="button-save-post"
                          >
                            {editingPost ? "Update" : "Publish"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Posts List */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <Card className="glass">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No posts yet. Create your first post!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id} className="glass" data-testid={`post-item-${post.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{post.title}</h3>
                                {post.editedAt && (
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-edited-${post.id}`}>
                                    Edited
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Published {new Date(post.createdAt!).toLocaleDateString()}
                                {post.editedAt && (
                                  <> • Edited {new Date(post.editedAt).toLocaleDateString()}</>
                                )}
                                {" "} • {post.likes} likes
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(post)}
                                data-testid={`button-edit-post-${post.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-post-${post.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {post.content && (
                            <p className="text-muted-foreground text-sm mb-4">{post.content.slice(0, 100)}...</p>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge variant={post.visibility === "public" ? "default" : "secondary"}>
                              {post.visibility === "public" ? "Public" : post.visibility === "members" ? "Members" : "PPV"}
                            </Badge>
                            {post.price && post.price > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {(post.price / 100).toFixed(2)} SUI
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-8">Analytics Dashboard</h2>

                {/* Overview Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card className="glass" data-testid="analytics-supporters">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Supporters</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.subscriberCount || 0}</p>
                        </div>
                        <div className="gradient-primary p-3 rounded-lg">
                          <Users className="text-white h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-500 text-sm font-medium">+12%</span>
                        <span className="text-muted-foreground text-sm ml-2">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass" data-testid="analytics-revenue">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-foreground">
                            ${((analytics?.monthlyRevenue || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-secondary p-3 rounded-lg">
                          <DollarSign className="text-white h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-500 text-sm font-medium">+23%</span>
                        <span className="text-muted-foreground text-sm ml-2">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass" data-testid="analytics-posts">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Posts</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.totalPosts || 0}</p>
                        </div>
                        <div className="bg-accent p-3 rounded-lg">
                          <Edit className="text-white h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-500 text-sm font-medium">+{posts.length}</span>
                        <span className="text-muted-foreground text-sm ml-2">this month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass" data-testid="analytics-engagement">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Likes</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.totalLikes || 0}</p>
                        </div>
                        <div className="gradient-secondary p-3 rounded-lg">
                          <Heart className="text-white h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-500 text-sm font-medium">+1.2%</span>
                        <span className="text-muted-foreground text-sm ml-2">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Tips */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Recent Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.tips && analytics.tips.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.tips.map((tip: any) => (
                          <div key={tip.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="font-medium text-foreground">${(tip.amount / 100).toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{tip.message || "No message"}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(tip.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No tips received yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-8">Members</h2>
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Member management coming soon!</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-8">Studio Settings</h2>
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Settings panel coming soon!</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

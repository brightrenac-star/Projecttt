import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import ContextualNavigation from "@/components/contextual-navigation";
import ContextualFooter from "@/components/contextual-footer";
import PostCard from "@/components/posts/post-card";
import { CompactPostComposer } from "@/components/posts/compact-post-composer";
import { SubscribeButton } from "@/components/wallet/subscribe-button";
import { TipButton } from "@/components/wallet/tip-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Edit, Globe, Instagram, Twitter, Youtube } from "lucide-react";

export default function CreatorProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user } = useAuth();

  // Fetch creator data
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ['/api/creators', handle],
    enabled: !!handle,
  });

  // Fetch creator's posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/creators', creator?.id, 'posts'],
    enabled: !!creator?.id,
  });

  // Check if current user is viewing their own profile
  const isOwnProfile = user?.id === creator?.userId;
  const canPost = isOwnProfile;

  // Check subscription status
  const { data: userSubscription } = useQuery({
    queryKey: ['/api/subscriptions/check', creator?.id],
    enabled: !!creator?.id && !!user && !isOwnProfile,
  });

  const handlePostCreated = () => {
    // Refresh posts when a new post is created
  };

  if (creatorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-purple-50/20 dark:from-blue-950/20 dark:via-background dark:to-purple-950/10">
        <ContextualNavigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="space-y-6 max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/30 rounded mb-4"></div>
              <div className="h-4 bg-muted/30 rounded mb-2"></div>
              <div className="h-4 bg-muted/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-purple-50/20 dark:from-blue-950/20 dark:via-background dark:to-purple-950/10">
        <ContextualNavigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="glass-strong">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Creator Not Found</h2>
              <p className="text-muted-foreground">The creator you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-purple-50/20 dark:from-blue-950/20 dark:via-background dark:to-purple-950/10">
      <ContextualNavigation />
      
      <main className="pt-16">
        {/* Modern Banner Section with Enhanced Gradient */}
        <div className="relative">
          {/* Banner Image */}
          <div className="h-48 md:h-64 lg:h-80 overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
            {creator.banner ? (
              <img 
                src={creator.banner} 
                alt={`${creator.name} banner`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-60"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
          </div>

          {/* Profile Picture - Overlapping Banner */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="relative">
              {creator.avatar ? (
                <img 
                  src={creator.avatar} 
                  alt={`${creator.name} avatar`} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-xl"
                  data-testid="creator-avatar"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full gradient-primary flex items-center justify-center border-4 border-background shadow-xl">
                  <span className="text-white font-bold text-4xl md:text-5xl">
                    {creator.name.charAt(0)}
                  </span>
                </div>
              )}
              {isOwnProfile && (
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2 w-12 h-12 rounded-full p-0 bg-background border border-border hover:bg-muted"
                  data-testid="button-change-avatar"
                >
                  <Camera className="w-5 h-5 text-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Section with Glass Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/10 via-background/95 to-background backdrop-blur-sm"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-20 pb-8 text-center">
              {/* Name and Handle */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="creator-name">
                {creator.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">@{creator.handle}</p>

              {/* Bio */}
              {creator.bio && (
                <p className="text-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                  {creator.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{creator.subscriberCount || 0}</div>
                  <div className="text-sm text-muted-foreground">supporters</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">posts</div>
                </div>
              </div>

              {/* Categories */}
              {creator.categories && creator.categories.length > 0 && (
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                  {creator.categories.slice(0, 4).map((category) => (
                    <Badge key={category} variant="secondary" className="px-3 py-1">
                      {category}
                    </Badge>
                  ))}
                  {creator.categories.length > 4 && (
                    <Badge variant="outline" className="px-3 py-1">
                      +{creator.categories.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              {/* Social Media Icons */}
              {creator.links && Object.keys(creator.links).length > 0 && (
                <div className="flex justify-center gap-4 mb-8">
                  {creator.links.website && (
                    <a 
                      href={creator.links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      data-testid="link-website"
                    >
                      <Globe className="w-6 h-6 text-foreground" />
                    </a>
                  )}
                  {creator.links.instagram && (
                    <a 
                      href={creator.links.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      data-testid="link-instagram"
                    >
                      <Instagram className="w-6 h-6 text-foreground" />
                    </a>
                  )}
                  {creator.links.twitter && (
                    <a 
                      href={creator.links.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      data-testid="link-twitter"
                    >
                      <Twitter className="w-6 h-6 text-foreground" />
                    </a>
                  )}
                  {creator.links.youtube && (
                    <a 
                      href={creator.links.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      data-testid="link-youtube"
                    >
                      <Youtube className="w-6 h-6 text-foreground" />
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                {isOwnProfile ? (
                  // Own profile - show edit button
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 h-12"
                    data-testid="button-edit-profile"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  // Viewing someone else's profile - show tip and subscribe
                  <>
                    <SubscribeButton 
                      creatorId={creator.id}
                      creatorName={creator.name}
                      className="px-6 py-3 h-12"
                    />
                    <TipButton 
                      creatorId={creator.id}
                      creatorName={creator.name}
                      variant="outline"
                      className="px-6 py-3 h-12"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed Section with Distinct Background */}
        <div className="bg-gradient-to-b from-purple-50/10 via-background to-background dark:from-purple-950/5 dark:via-background dark:to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {/* Inline Post Composer - Only shown for profile owner */}
            {canPost && (
              <div className="mb-8">
                <CompactPostComposer 
                  creatorId={creator.id} 
                  onPostCreated={handlePostCreated}
                />
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6 pb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Latest Posts</h2>
              
              {postsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="glass animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted/30 rounded mb-2"></div>
                        <div className="h-3 bg-muted/30 rounded mb-4"></div>
                        <div className="h-20 bg-muted/30 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No posts yet. Check back later!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => {
                    // Determine if post should show as locked
                    const shouldShowLocked = !isOwnProfile && post.visibility !== "public" && (
                      (post.visibility === "members" && !userSubscription?.active) ||
                      (post.visibility === "ppv" && !(post as any).isUnlocked)
                    );
                    
                    return (
                      <PostCard
                        key={post.id}
                        post={{ 
                          ...post, 
                          title: post.title || undefined,
                          content: post.content || "",
                          visibility: post.visibility as "public" | "members" | "ppv",
                          price: post.price || undefined,
                          createdAt: post.createdAt || new Date(),
                          isLocked: shouldShowLocked,
                          mediaUrl: post.mediaUrl || undefined,
                          editedAt: post.editedAt || undefined,
                          likes: post.likes || 0
                        }}
                        creator={{
                          id: creator.id,
                          userId: creator.userId,
                          name: creator.name,
                          handle: creator.handle,
                          avatar: creator.avatar || undefined
                        }}
                        userSubscribed={userSubscription?.active || false}
                        onPostUpdated={handlePostCreated}
                        onPostDeleted={handlePostCreated}
                        showComments={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ContextualFooter />
    </div>
  );
}
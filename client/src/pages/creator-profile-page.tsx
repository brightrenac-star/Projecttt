import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { CompactPostComposer } from "@/components/posts/compact-post-composer";
import { LockedPostPreview } from "@/components/posts/locked-post-preview";
import { TipButton } from "@/components/wallet/tip-button";
import { SubscribeButton } from "@/components/wallet/subscribe-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Star, Calendar, Edit } from "lucide-react";
import type { Creator, Post } from "@shared/schema";

export default function CreatorProfilePage() {
  const { handle } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get creator profile
  const { data: creator, isLoading: creatorLoading } = useQuery<Creator>({
    queryKey: ["/api/creators", handle],
    enabled: !!handle,
  });

  // Get creator posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/creators", creator?.id, "posts"],
    enabled: !!creator?.id,
  });

  // Check if user is viewing their own profile and has creator role
  const isOwnProfile = user && creator && user.id === creator.userId;
  const canPost = isOwnProfile && user?.role === "creator";
  
  // Get user's subscription status for this creator
  const { data: userSubscription } = useQuery<any>({    
    queryKey: ["/api/subscriptions/check", creator?.id],
    enabled: !!user && !!creator && !isOwnProfile,
  });

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/creators", creator?.id, "posts"] });
  };





  if (creatorLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="glass rounded-xl p-8">
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
      <div className="min-h-screen">
        <Navigation />
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
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {creator.banner ? (
            <img 
              src={creator.banner} 
              alt={`${creator.name} banner`} 
              className="w-full h-64 md:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-80 gradient-primary opacity-30"></div>
          )}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="relative -mt-20 mb-8">
            <Card className="glass-strong">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    {creator.avatar ? (
                      <img 
                        src={creator.avatar} 
                        alt={`${creator.name} avatar`} 
                        className="w-20 h-20 rounded-full border-4 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center border-4 border-white">
                        <span className="text-white font-bold text-2xl">
                          {creator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-foreground" data-testid="creator-name">{creator.name}</h1>
                      <p className="text-muted-foreground">@{creator.handle}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {creator.subscriberCount || 0} supporters
                        </span>
                        {creator.category && (
                          <Badge variant="secondary">{creator.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      // Own profile - show edit button and go to studio
                      <>
                        <Button 
                          variant="outline" 
                          className="glass border-border hover-scale transition-smooth" 
                          data-testid="button-edit-profile"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button 
                          className="gradient-primary text-primary-foreground hover-scale transition-smooth" 
                          data-testid="button-go-to-studio"
                        >
                          Go to Studio
                        </Button>
                      </>
                    ) : (
                      // Viewing someone else's profile - show tip and subscribe
                      <>
                        <TipButton 
                          creatorId={creator.id}
                          creatorName={creator.name}
                        />
                        <SubscribeButton 
                          creatorId={creator.id}
                          creatorName={creator.name}
                        />
                      </>
                    )}
                  </div>
                </div>

                {creator.bio && (
                  <div className="mt-6">
                    <p className="text-muted-foreground">{creator.bio}</p>
                  </div>
                )}

                {creator.links && Object.keys(creator.links).length > 0 && (
                  <div className="mt-4 flex gap-3">
                    {creator.links.website && (
                      <a 
                        href={creator.links.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid="link-website"
                      >
                        Website
                      </a>
                    )}
                    {creator.links.twitter && (
                      <a 
                        href={creator.links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid="link-twitter"
                      >
                        Twitter
                      </a>
                    )}
                    {creator.links.instagram && (
                      <a 
                        href={creator.links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid="link-instagram"
                      >
                        Instagram
                      </a>
                    )}
                    {creator.links.youtube && (
                      <a 
                        href={creator.links.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid="link-youtube"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compact Post Composer - Only shown for profile owner */}
          {canPost && (
            <CompactPostComposer 
              creatorId={creator.id} 
              onPostCreated={handlePostCreated}
            />
          )}

          {/* Posts Section */}
          <div className="grid lg:grid-cols-3 gap-8 pb-16">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Posts</h2>
              
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
                      <LockedPostPreview
                        key={post.id}
                        post={{ 
                          ...post, 
                          title: post.title || undefined,
                          content: post.content || "",
                          isLocked: shouldShowLocked,
                          mediaUrl: post.mediaUrl || undefined 
                        }}
                        creator={{
                          id: creator.id,
                          name: creator.name,
                          handle: creator.handle
                        }}
                        userSubscribed={userSubscription?.active || false}
                        onUnlocked={handlePostCreated}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Creator Stats */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Creator Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supporters</span>
                    <span className="font-semibold">{creator.subscriberCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posts</span>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold">
                      {new Date(creator.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Tiers */}
              {creator.tiers && creator.tiers.length > 0 && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Subscription Tiers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {creator.tiers.map((tier) => (
                      <div key={tier.id} className="glass rounded-lg p-4 border border-border">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-foreground">{tier.name}</h4>
                          <span className="text-primary font-bold">${tier.price}/mo</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {tier.perks.slice(0, 3).map((perk, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                              {perk}
                            </li>
                          ))}
                          {tier.perks.length > 3 && (
                            <li className="text-xs">+{tier.perks.length - 3} more perks</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

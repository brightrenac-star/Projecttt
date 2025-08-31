import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket, UserPlus, Heart, TrendingUp, Wallet, Users } from "lucide-react";
import type { Creator, Post } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  
  // Get featured creators
  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });
  
  // Get trending posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });
  
  const featuredCreators = creators.slice(0, 6);
  const trendingPosts = posts.slice(0, 6);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '-2s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '-4s' }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-spacing-xl sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Support Your Favorite
                <span className="gradient-primary bg-clip-text text-transparent ml-3">Creators</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Join Society, the revolutionary platform where creators connect with supporters through exclusive content, direct support, and community building.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  user.role === "creator" ? (
                    <Link href="/studio">
                      <Button size="lg" className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid="button-go-to-studio">
                        Go to Studio
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/discover">
                      <Button size="lg" className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid="button-continue-exploring">
                        Continue Exploring
                      </Button>
                    </Link>
                  )
                ) : (
                  <>
                    <Link href="/auth">
                      <Button size="lg" className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid="button-start-creating">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/discover">
                      <Button variant="outline" size="lg" className="glass border-border hover-scale transition-smooth" data-testid="button-explore-creators">
                        Explore
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-spacing-xl sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Society Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to start your creator journey</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="glass hover-scale transition-smooth" data-testid="card-how-it-works-create">
              <CardContent className="p-8 text-center">
                <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">1. Create</h3>
                <p className="text-muted-foreground">Sign up and set up your creator profile with your unique content and style.</p>
              </CardContent>
            </Card>

            <Card className="glass hover-scale transition-smooth" data-testid="card-how-it-works-support">
              <CardContent className="p-8 text-center">
                <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">2. Support</h3>
                <p className="text-muted-foreground">Supporters discover and fund creators through tips, subscriptions, and exclusive content.</p>
              </CardContent>
            </Card>

            <Card className="glass hover-scale transition-smooth" data-testid="card-how-it-works-grow">
              <CardContent className="p-8 text-center">
                <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">3. Grow</h3>
                <p className="text-muted-foreground">Build your community with analytics, engagement tools, and direct fan interaction.</p>
              </CardContent>
            </Card>

            <Card className="glass hover-scale transition-smooth" data-testid="card-how-it-works-earn">
              <CardContent className="p-8 text-center">
                <div className="gradient-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">4. Earn</h3>
                <p className="text-muted-foreground">Withdraw your earnings through SUI blockchain technology with minimal fees.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Creators Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-spacing-xl sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Creators</h2>
            <p className="text-xl text-muted-foreground">Discover amazing creators in our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" data-testid="featured-creators">
            {creatorsLoading ? (
              // Loading state
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="glass overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="ml-3 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredCreators.length > 0 ? (
              featuredCreators.map((creator, index) => (
                <Link href={`/creator/${creator.handle}`} key={creator.id}>
                  <Card className="glass hover-scale transition-smooth overflow-hidden cursor-pointer" data-testid={`card-featured-creator-${index}`}>
                    {creator.banner && (
                      <img 
                        src={creator.banner} 
                        alt={creator.category || "Creator banner"} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {creator.avatar ? (
                          <img 
                            src={creator.avatar} 
                            alt={`${creator.name} avatar`} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                            {creator.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="ml-3">
                          <h3 className="font-semibold text-foreground">{creator.name}</h3>
                          <p className="text-sm text-muted-foreground">{creator.category || "Creator"}</p>
                        </div>
                      </div>
                      {creator.bio && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">{creator.bio}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {creator.subscriberCount || 0} supporters
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          View Profile
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Empty state
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground mb-4">No featured creators yet.</p>
                <Link href="/auth">
                  <Button className="gradient-primary text-primary-foreground" data-testid="button-become-creator">
                    Become the First Creator
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Trending Posts Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trending Posts</h2>
            <p className="text-xl text-muted-foreground">See what's popular in our community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="trending-posts">
            {postsLoading ? (
              // Loading state
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="glass">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="ml-3 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : trendingPosts.length > 0 ? (
              trendingPosts.map((post, index) => {
                const creator = creators.find(c => c.id === post.creatorId);
                return (
                  <Card key={post.id} className="glass hover-scale transition-smooth cursor-pointer" data-testid={`card-trending-post-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {creator?.avatar ? (
                          <img 
                            src={creator.avatar} 
                            alt={`${creator.name} avatar`} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                            {creator?.name.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="font-medium text-foreground">{creator?.name || "Creator"}</p>
                          <p className="text-xs text-muted-foreground">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}</p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                      {post.content && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.content}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes || 0} likes
                        </div>
                        {post.visibility === "ppv" && post.price && (
                          <Badge variant="outline" className="text-primary border-primary/20">
                            ${(post.price / 100).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Empty state
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground mb-4">No posts yet.</p>
                <Link href="/auth">
                  <Button className="gradient-primary text-primary-foreground" data-testid="button-create-first-post">
                    Share the First Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card className="glass-strong">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Start Your Creator Journey?</h2>
              <p className="text-xl text-muted-foreground mb-8">Join thousands of creators who are already building their communities on Society.</p>
              <Link href="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid="button-create-studio">
                  Create Your Studio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

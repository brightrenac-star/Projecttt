import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import Footer from "../components/footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  FileText, 
  Heart, 
  TrendingUp,
  Calendar,
  Clock,
  Gift,
  Settings
} from "lucide-react";

import type { Creator, Tip } from "@shared/schema";

interface CreatorAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  subscriberCount: number;
  recentTips: number;
  totalPosts: number;
  totalLikes: number;
  tips: Tip[];
}

export default function StudioDataPage() {
  const { user } = useAuth();

  // Get creator profile
  const { data: creator } = useQuery<Creator>({
    queryKey: ["/api/creators", user?.id],
    queryFn: async () => {
      if (user?.role !== "creator") return null;
      const creators = await fetch("/api/creators").then(res => res.json());
      return creators.find((c: Creator) => c.userId === user.id) || null;
    },
    enabled: !!user && user.role === "creator",
  });

  // Get analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<CreatorAnalytics>({
    queryKey: ["/api/creators", creator?.id, "analytics"],
    queryFn: async () => {
      if (!creator?.id) throw new Error("Creator not found");
      const response = await fetch(`/api/creators/${creator.id}/analytics`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: !!creator?.id,
  });

  if (!user || user.role !== "creator") {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="flex items-center justify-center py-24">
          <Card className="glass p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Creator access required.</p>
              <Link href="/auth">
                <Button className="gradient-primary text-primary-foreground" data-testid="button-become-creator">
                  Become a Creator
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="flex items-center justify-center py-24">
          <Card className="glass p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Creator profile not found.</p>
              <Link href="/profile">
                <Button className="gradient-primary text-primary-foreground" data-testid="button-create-profile">
                  Create Creator Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/studio">
              <Button variant="ghost" size="sm" data-testid="button-back-to-studio">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-analytics">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your performance and earnings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
            <TabsTrigger value="audience" data-testid="tab-audience">Audience</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {analyticsLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="glass">
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-8 w-20 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <div className="text-2xl font-bold text-foreground" data-testid="stat-total-revenue">
                            ${((analytics?.totalRevenue || 0) / 100).toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground">All time</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                          <div className="text-2xl font-bold text-foreground" data-testid="stat-monthly-revenue">
                            ${((analytics?.monthlyRevenue || 0) / 100).toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground">This month</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                          <div className="text-2xl font-bold text-foreground" data-testid="stat-subscribers">
                            {analytics?.subscriberCount || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">Active supporters</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                          <div className="text-2xl font-bold text-foreground" data-testid="stat-total-posts">
                            {analytics?.totalPosts || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">Published content</p>
                        </div>
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Tips */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Recent Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : analytics?.tips && analytics.tips.length > 0 ? (
                    <div className="space-y-4" data-testid="recent-tips">
                      {analytics.tips.map((tip, index) => (
                        <div key={tip.id} className="flex justify-between items-center" data-testid={`tip-${index}`}>
                          <div>
                            <p className="font-medium text-foreground">${(tip.amount / 100).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {tip.createdAt ? new Date(tip.createdAt).toLocaleDateString() : "Recent"}
                              {tip.message && ` • "${tip.message}"`}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-primary border-primary/20">
                            Tip
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tips received yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="engagement-metrics">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Likes</span>
                        <div className="text-xl font-bold text-foreground" data-testid="stat-total-likes">
                          {analytics?.totalLikes || 0}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Recent Tips (7 days)</span>
                        <div className="text-xl font-bold text-foreground" data-testid="stat-recent-tips">
                          ${((analytics?.recentTips || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Avg. Likes per Post</span>
                        <div className="text-xl font-bold text-foreground" data-testid="stat-avg-likes">
                          {analytics?.totalPosts && analytics.totalPosts > 0 
                            ? Math.round((analytics.totalLikes || 0) / analytics.totalPosts)
                            : 0
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="revenue-breakdown">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Monthly Subscriptions</span>
                        <span className="font-bold text-foreground" data-testid="revenue-subscriptions">
                          ${((analytics?.monthlyRevenue || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Recent Tips (7 days)</span>
                        <span className="font-bold text-foreground" data-testid="revenue-tips">
                          ${((analytics?.recentTips || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total All Time</span>
                        <span className="font-bold text-primary text-lg" data-testid="revenue-total">
                          ${((analytics?.totalRevenue || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Payout Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payout Address</span>
                      <div className="text-right">
                        {creator?.payoutAddress ? (
                          <div>
                            <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="text-payout-address">
                              {creator.payoutAddress.slice(0, 6)}...{creator.payoutAddress.slice(-4)}
                            </code>
                            <Badge variant="default" className="ml-2">Verified</Badge>
                          </div>
                        ) : (
                          <Badge variant="destructive" data-testid="badge-no-payout">Setup Required</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Next Payout</span>
                      <span className="text-foreground" data-testid="text-next-payout">
                        {creator?.payoutAddress ? "1st of next month" : "Setup payout address"}
                      </span>
                    </div>
                    <div className="pt-4">
                      <Link href="/profile">
                        <Button variant="outline" className="w-full" data-testid="button-setup-payout">
                          {creator?.payoutAddress ? "Update Payout Settings" : "Setup Payout Address"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 glass rounded-lg">
                    <div className="text-3xl font-bold text-foreground mb-2" data-testid="audience-subscribers">
                      {analytics?.subscriberCount || 0}
                    </div>
                    <div className="text-muted-foreground">Total Subscribers</div>
                  </div>
                  
                  <div className="text-center p-6 glass rounded-lg">
                    <div className="text-3xl font-bold text-foreground mb-2" data-testid="audience-tips-count">
                      {analytics?.tips?.length || 0}
                    </div>
                    <div className="text-muted-foreground">Tips Received</div>
                  </div>
                  
                  <div className="text-center p-6 glass rounded-lg">
                    <div className="text-3xl font-bold text-foreground mb-2" data-testid="audience-engagement">
                      {analytics?.totalLikes || 0}
                    </div>
                    <div className="text-muted-foreground">Total Likes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Publishing Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Posts</span>
                        <span className="font-bold text-foreground" data-testid="content-total-posts">
                          {analytics?.totalPosts || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Likes per Post</span>
                        <span className="font-bold text-foreground" data-testid="content-avg-likes">
                          {analytics?.totalPosts && analytics.totalPosts > 0 
                            ? Math.round((analytics.totalLikes || 0) / analytics.totalPosts)
                            : 0
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link href="/studio">
                        <Button variant="outline" className="w-full justify-start" data-testid="button-create-post">
                          <FileText className="w-4 h-4 mr-2" />
                          Create New Post
                        </Button>
                      </Link>
                      <Link href="/studio">
                        <Button variant="outline" className="w-full justify-start" data-testid="button-manage-posts">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Posts
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
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
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  revenueHistory: { month: string; revenue: number; tips: number; subscriptions: number }[];
  subscriberGrowth: { month: string; count: number }[];
  postEngagement: { month: string; posts: number; likes: number; views: number }[];
  earningsBreakdown: { name: string; value: number; color: string }[];
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
      
      // Mock comprehensive analytics data with charts
      const mockAnalytics: CreatorAnalytics = {
        totalRevenue: 245000, // $2,450 in cents
        monthlyRevenue: 89000, // $890 in cents  
        subscriberCount: 1247,
        recentTips: 34,
        totalPosts: 156,
        totalLikes: 8934,
        tips: [
          { id: "1", creatorId: creator.id, supporterId: "user1", amount: 2500, message: "Love your content!", createdAt: new Date().toISOString() },
          { id: "2", creatorId: creator.id, supporterId: "user2", amount: 1000, message: "Keep it up!", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: "3", creatorId: creator.id, supporterId: "user3", amount: 5000, message: "Amazing work", createdAt: new Date(Date.now() - 172800000).toISOString() },
        ],
        revenueHistory: [
          { month: "Jul", revenue: 45000, tips: 12000, subscriptions: 33000 },
          { month: "Aug", revenue: 58000, tips: 15000, subscriptions: 43000 },
          { month: "Sep", revenue: 67000, tips: 18000, subscriptions: 49000 },
          { month: "Oct", revenue: 78000, tips: 22000, subscriptions: 56000 },
          { month: "Nov", revenue: 82000, tips: 25000, subscriptions: 57000 },
          { month: "Dec", revenue: 89000, tips: 28000, subscriptions: 61000 },
        ],
        subscriberGrowth: [
          { month: "Jul", count: 892 },
          { month: "Aug", count: 1034 },
          { month: "Sep", count: 1156 },
          { month: "Oct", count: 1203 },
          { month: "Nov", count: 1224 },
          { month: "Dec", count: 1247 },
        ],
        postEngagement: [
          { month: "Jul", posts: 12, likes: 1340, views: 8920 },
          { month: "Aug", posts: 15, likes: 1680, views: 11200 },
          { month: "Sep", posts: 18, likes: 2010, views: 13400 },
          { month: "Oct", posts: 14, likes: 1890, views: 12600 },
          { month: "Nov", posts: 16, likes: 2150, views: 14300 },
          { month: "Dec", posts: 13, likes: 1864, views: 12400 },
        ],
        earningsBreakdown: [
          { name: "Subscriptions", value: 61000, color: "#40E0D0" },
          { name: "Tips", value: 28000, color: "#98FB98" },
          { name: "PPV Content", value: 12000, color: "#9370DB" },
        ],
      };
      
      return mockAnalytics;
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
            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue History Chart */}
              <Card className="glass lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trends (6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={analytics?.revenueHistory}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
                        <Tooltip formatter={(value: number) => [`$${(value / 100).toFixed(2)}`, '']} />
                        <Legend />
                        <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#40E0D0" fill="#40E0D0" fillOpacity={0.6} name="Subscriptions" />
                        <Area type="monotone" dataKey="tips" stackId="1" stroke="#98FB98" fill="#98FB98" fillOpacity={0.6} name="Tips" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Subscriber Growth Chart */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Subscriber Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={analytics?.subscriberGrowth}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#40E0D0" strokeWidth={3} dot={{ fill: '#40E0D0' }} name="Subscribers" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Earnings Breakdown Pie Chart */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics?.earningsBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics?.earningsBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${(value / 100).toFixed(2)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Audience Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="audience-subscribers">
                    {analytics?.subscriberCount || 0}
                  </div>
                  <div className="text-muted-foreground">Total Subscribers</div>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="audience-tips-count">
                    {analytics?.tips?.length || 0}
                  </div>
                  <div className="text-muted-foreground">Tips Received</div>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="audience-engagement">
                    {analytics?.totalLikes || 0}
                  </div>
                  <div className="text-muted-foreground">Total Likes</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Posts Performance Chart */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Monthly Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={analytics?.postEngagement}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="posts" stroke="#9370DB" fill="#9370DB" fillOpacity={0.6} name="Posts Created" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Engagement Metrics Chart */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics?.postEngagement}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="likes" fill="#98FB98" name="Likes" />
                        <Bar dataKey="views" fill="#40E0D0" name="Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Content Stats and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Publishing Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Posts</span>
                      <span className="font-bold text-foreground text-xl" data-testid="content-total-posts">
                        {analytics?.totalPosts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average Likes per Post</span>
                      <span className="font-bold text-foreground text-xl" data-testid="content-avg-likes">
                        {analytics?.totalPosts && analytics.totalPosts > 0 
                          ? Math.round((analytics.totalLikes || 0) / analytics.totalPosts)
                          : 0
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Engagement</span>
                      <span className="font-bold text-foreground text-xl" data-testid="content-total-likes">
                        {analytics?.totalLikes || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Content Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                    <Link href="/profile">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-profile-settings">
                        <Users className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
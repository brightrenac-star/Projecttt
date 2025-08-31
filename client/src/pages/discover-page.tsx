import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Heart, TrendingUp, Filter, X, Star } from "lucide-react";
import type { Creator, Post } from "@shared/schema";

const categories = [
  "Digital Artist",
  "Music Producer", 
  "Content Writer",
  "Photographer",
  "Developer",
  "Designer",
  "Educator",
  "Gaming",
  "Fitness",
  "Cooking",
  "Fashion",
  "Tech"
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "subscribers", label: "Most Subscribers" },
  { value: "earnings", label: "Top Earners" },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("creators");

  // Get creators and posts
  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  // Filter and sort creators
  const filteredCreators = useMemo(() => {
    let filtered = creators.filter(creator => {
      const matchesSearch = searchQuery === "" || 
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.handle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || creator.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort creators
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      case "subscribers":
        return filtered.sort((a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0));
      case "earnings":
        return filtered.sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
      default: // popular
        return filtered.sort((a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0));
    }
  }, [creators, searchQuery, selectedCategory, sortBy]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      if (!post.published || post.visibility !== "public") return false;
      
      const creator = creators.find(c => c.id === post.creatorId);
      const matchesSearch = searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case "popular":
        default:
          return (b.likes || 0) - (a.likes || 0);
      }
    });
  }, [posts, creators, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("popular");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || sortBy !== "popular";

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="heading-discover">
              Discover Amazing Creators
            </h1>
            <p className="text-xl text-muted-foreground">Find and support creators who inspire you</p>
          </div>

          {/* Search and Filters */}
          <Card className="glass mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search creators, content, or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-12"
                    data-testid="input-search-discover"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      data-testid="button-clear-search"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Filters Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                    data-testid="button-toggle-filters"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">•</span>}
                  </Button>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid="button-clear-filters"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="border-t border-border pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Sort by</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger data-testid="select-sort">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sortOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="creators" data-testid="tab-discover-creators">
                Creators ({filteredCreators.length})
              </TabsTrigger>
              <TabsTrigger value="posts" data-testid="tab-discover-posts">
                Posts ({filteredPosts.length})
              </TabsTrigger>
            </TabsList>

            {/* Creators Tab */}
            <TabsContent value="creators">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="creators-grid">
                {creatorsLoading ? (
                  // Loading state
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="glass">
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
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-8 w-20 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredCreators.length > 0 ? (
                  filteredCreators.map((creator, index) => (
                    <Link href={`/creator/${creator.handle}`} key={creator.id}>
                      <Card className="glass hover-scale transition-smooth cursor-pointer" data-testid={`card-discover-creator-${index}`}>
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
                              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                            </div>
                          </div>
                          
                          {creator.category && (
                            <Badge variant="outline" className="mb-3 text-primary border-primary/20">
                              {creator.category}
                            </Badge>
                          )}
                          
                          {creator.bio && (
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{creator.bio}</p>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="w-4 h-4 mr-1" />
                              {creator.subscriberCount || 0} supporters
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="w-4 h-4 mr-1" />
                              ${((creator.totalEarnings || 0) / 100).toFixed(0)} earned
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedCategory !== "all" 
                        ? "No creators match your search criteria."
                        : "No creators have joined yet."
                      }
                    </p>
                    {searchQuery || selectedCategory !== "all" ? (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        data-testid="button-clear-search-results"
                      >
                        Clear search
                      </Button>
                    ) : (
                      <Link href="/auth">
                        <Button className="gradient-primary text-primary-foreground" data-testid="button-be-first-creator">
                          Be the First Creator
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="posts-grid">
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
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => {
                    const creator = creators.find(c => c.id === post.creatorId);
                    return (
                      <Card key={post.id} className="glass hover-scale transition-smooth cursor-pointer" data-testid={`card-discover-post-${index}`}>
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
                              <p className="text-xs text-muted-foreground">
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                              </p>
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
                            
                            <div className="flex items-center gap-2">
                              {post.visibility === "ppv" && post.price && (
                                <Badge variant="outline" className="text-primary border-primary/20">
                                  ${(post.price / 100).toFixed(2)}
                                </Badge>
                              )}
                              <Badge variant={post.visibility === "public" ? "default" : "secondary"}>
                                {post.visibility === "public" ? "Public" : post.visibility === "members" ? "Members" : "PPV"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "No posts match your search criteria."
                        : "No posts have been published yet."
                      }
                    </p>
                    {searchQuery ? (
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                        data-testid="button-clear-post-search"
                      >
                        Clear search
                      </Button>
                    ) : (
                      <Link href="/auth">
                        <Button className="gradient-primary text-primary-foreground" data-testid="button-create-first-post">
                          Share the First Post
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Found {activeTab === "creators" ? filteredCreators.length : filteredPosts.length} results
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
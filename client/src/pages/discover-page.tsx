import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Heart } from "lucide-react";
import type { Creator } from "@shared/schema";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const categories = ["all", "art", "music", "writing", "tech", "photography", "gaming", "fashion"];

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || creator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Discover Amazing Creators</h1>
            <p className="text-xl text-muted-foreground">Find and support creators who inspire you</p>
          </div>

          {/* Search and Filters */}
          <Card className="glass mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search creators, content, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12"
                      data-testid="input-search-creators"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "gradient-primary text-primary-foreground" : "glass border-border hover-scale transition-smooth"}
                      data-testid={`filter-${category}`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creators Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass animate-pulse">
                  <div className="h-48 bg-muted/30 rounded-t-xl"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted/30 rounded mb-2"></div>
                    <div className="h-3 bg-muted/30 rounded mb-4"></div>
                    <div className="h-3 bg-muted/30 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCreators.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No creators found matching your criteria.</p>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCreators.map((creator) => (
                <Card key={creator.id} className="glass hover-scale transition-smooth overflow-hidden" data-testid={`creator-card-${creator.handle}`}>
                  {creator.banner ? (
                    <img 
                      src={creator.banner} 
                      alt={`${creator.name} banner`} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 gradient-primary opacity-30"></div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {creator.avatar ? (
                        <img 
                          src={creator.avatar} 
                          alt={`${creator.name} avatar`} 
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {creator.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="font-semibold text-foreground">{creator.name}</h3>
                        <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                      </div>
                    </div>

                    {creator.bio && (
                      <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{creator.bio}</p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {creator.subscriberCount || 0} supporters
                        </span>
                        {creator.category && (
                          <Badge variant="secondary" className="text-xs">
                            {creator.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-sm text-muted-foreground ml-1">4.8</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/creator/${creator.handle}`} className="flex-1">
                        <Button className="w-full gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid={`button-view-creator-${creator.handle}`}>
                          View Profile
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" className="glass border-border hover-scale transition-smooth" data-testid={`button-like-creator-${creator.handle}`}>
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredCreators.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="glass border-border hover-scale transition-smooth" data-testid="button-load-more">
                Load More Creators
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

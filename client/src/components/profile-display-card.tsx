import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { User, Category } from "@shared/schema";

interface ProfileDisplayCardProps {
  user: User;
  categories?: Category[];
  className?: string;
}

export default function ProfileDisplayCard({ user, categories = [], className }: ProfileDisplayCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopySID = async () => {
    try {
      await navigator.clipboard.writeText(user.sid);
      setCopied(true);
      toast({ title: "SID copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ 
        title: "Failed to copy SID", 
        description: "Please copy manually", 
        variant: "destructive" 
      });
    }
  };

  // Get the selected categories with 18+ content prioritized
  const userCategories = user.creatorCategories || [];
  const adultCategories = userCategories.filter(cat => 
    categories.find(c => c.name === cat)?.isAdult
  );
  const regularCategories = userCategories.filter(cat => 
    !categories.find(c => c.name === cat)?.isAdult
  );
  
  // Show up to 4 categories, prioritizing 18+ content
  const displayCategories = [...adultCategories, ...regularCategories].slice(0, 4);

  return (
    <Card className={`glass overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Background with gradient overlay */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6">
          <div className="flex items-start gap-4">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.displayName} avatar`} 
                  className="w-16 h-16 rounded-full border-4 border-white/20 object-cover shadow-lg"
                  data-testid="profile-avatar"
                />
              ) : (
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center border-4 border-white/20 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              {/* Display Name */}
              <h2 className="text-xl font-bold text-foreground mb-1" data-testid="profile-display-name">
                {user.displayName}
              </h2>

              {/* SID */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">SID:</span>
                <code className="text-sm font-mono bg-background/50 px-2 py-1 rounded border border-border" data-testid="profile-sid">
                  {user.sid}
                </code>
                <button
                  onClick={handleCopySID}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-background/30"
                  data-testid="button-copy-sid"
                  title="Copy SID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid="profile-bio">
                  {user.bio}
                </p>
              )}

              {/* Categories */}
              {displayCategories.length > 0 && (
                <div className="flex flex-wrap gap-1" data-testid="profile-categories">
                  {displayCategories.map((categoryName) => {
                    const category = categories.find(c => c.name === categoryName);
                    const isAdult = category?.isAdult;
                    
                    return (
                      <Badge 
                        key={categoryName}
                        variant={isAdult ? "destructive" : "secondary"}
                        className={`text-xs ${isAdult ? "bg-red-500 text-white" : ""}`}
                        data-testid={`badge-category-${categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {isAdult && "🔞 "}{categoryName}
                      </Badge>
                    );
                  })}
                  {userCategories.length > 4 && (
                    <Badge variant="outline" className="text-xs" data-testid="badge-more-categories">
                      +{userCategories.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-30"></div>
        </div>
      </CardContent>
    </Card>
  );
}
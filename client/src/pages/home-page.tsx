import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, UserPlus, Heart, TrendingUp, Wallet } from "lucide-react";

export default function HomePage() {
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Support Your Favorite
                <span className="gradient-primary bg-clip-text text-transparent ml-3">Creators</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Join Suiciety, the revolutionary platform where creators connect with supporters through exclusive content, direct support, and community building.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth">
                  <Button size="lg" className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid="button-start-creating">
                    Start Creating
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button variant="outline" size="lg" className="glass border-border hover-scale transition-smooth" data-testid="button-explore-creators">
                    Explore Creators
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Suiciety Works</h2>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Creators</h2>
            <p className="text-xl text-muted-foreground">Discover amazing creators in our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Featured Creator Examples */}
            {[
              {
                name: "Sarah Chen",
                category: "Digital Artist",
                description: "Creating stunning digital art and illustrations. Join my journey!",
                supporters: "1.2k supporters",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              },
              {
                name: "Alex Rivera",
                category: "Music Producer", 
                description: "Producing electronic music and sharing my creative process.",
                supporters: "856 supporters",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              },
              {
                name: "Maya Johnson",
                category: "Content Writer",
                description: "Writing about technology, startups, and the future of work.",
                supporters: "2.1k supporters", 
                image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              }
            ].map((creator, index) => (
              <Card key={index} className="glass hover-scale transition-smooth overflow-hidden" data-testid={`card-featured-creator-${index}`}>
                <img 
                  src={creator.image} 
                  alt={creator.category} 
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={`https://images.unsplash.com/photo-${143876168 + index}1033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48`} 
                      alt={`${creator.name} portrait`} 
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-3">
                      <h3 className="font-semibold text-foreground">{creator.name}</h3>
                      <p className="text-sm text-muted-foreground">{creator.category}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{creator.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{creator.supporters}</span>
                    <Button className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid={`button-support-creator-${index}`}>
                      Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card className="glass-strong">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Start Your Creator Journey?</h2>
              <p className="text-xl text-muted-foreground mb-8">Join thousands of creators who are already building their communities on Suiciety.</p>
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

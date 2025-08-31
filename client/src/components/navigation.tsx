import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Search, Menu, User, Settings, LogOut, Mail, Send, ExternalLink } from "lucide-react";
import type { Creator } from "@shared/schema";

export default function Navigation() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Get creator profile for public profile link
  const { data: creator } = useQuery<Creator>({
    queryKey: ["/api/creators", user?.id],
    queryFn: async () => {
      if (user?.role !== "creator") return null;
      const creators = await fetch("/api/creators").then(res => res.json());
      return creators.find((c: Creator) => c.userId === user.id) || null;
    },
    enabled: !!user && user.role === "creator",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      // In a real app, this would send the message to a backend
      console.log('Sending message:', chatMessage);
      setChatMessage("");
      // For demo purposes, add a mock response
      setTimeout(() => {
        console.log('Mock response received');
      }, 1000);
    }
  };

  // Mock chat messages for demonstration
  const chatMessages = [
    { id: 1, sender: "Support", message: "Welcome to Society! How can we help you today?", timestamp: "2 hours ago", isSupport: true },
    { id: 2, sender: "You", message: "Hi, I have a question about creator payouts", timestamp: "1 hour ago", isSupport: false },
    { id: 3, sender: "Support", message: "I'd be happy to help with payout questions! What specifically would you like to know?", timestamp: "45 min ago", isSupport: true },
  ];

  return (
    <nav className="glass-strong fixed top-0 left-0 right-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer" data-testid="nav-logo">
              <div className="gradient-primary p-2 rounded-lg">
                <Rocket className="text-white text-xl" />
              </div>
              <span className="ml-3 text-xl font-bold text-foreground">Society</span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className="text-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="nav-home">
                Home
              </span>
            </Link>
            <Link href="/discover">
              <span className="text-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="nav-discover">
                Discover
              </span>
            </Link>
            {user?.role === "creator" && (
              <Link href="/studio">
                <span className="text-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="nav-studio">
                  Studio
                </span>
              </Link>
            )}
            <Link href="/help">
              <span className="text-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="nav-help">
                Help
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input/80 backdrop-blur-sm border-border pl-10"
                data-testid="nav-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </form>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Public Profile Button - Only for creators with profiles */}
                {user.role === "creator" && creator?.handle && (
                  <Link href={`/creator/${creator.handle}`}>
                    <Button variant="ghost" size="sm" className="text-foreground hover:text-primary transition-smooth" data-testid="nav-public-profile">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Public Profile</span>
                    </Button>
                  </Link>
                )}

                {/* Chat Button */}
                <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative text-foreground hover:text-primary transition-smooth" data-testid="nav-chat">
                      <Mail className="w-4 h-4" />
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center">
                        2
                      </Badge>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="glass-strong border-border">
                    <SheetHeader>
                      <SheetTitle className="text-foreground">Messages</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
                      <ScrollArea className="flex-1 mt-4">
                        <div className="space-y-4 pr-4">
                          {chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex flex-col space-y-1 ${
                                msg.isSupport ? 'items-start' : 'items-end'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  msg.isSupport
                                    ? 'glass text-foreground'
                                    : 'gradient-primary text-primary-foreground'
                                }`}
                              >
                                <p className="text-sm font-medium">{msg.sender}</p>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="mt-4 pt-4 border-t border-border">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Textarea
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 min-h-[60px] bg-input/80 backdrop-blur-sm border-border resize-none"
                            data-testid="input-chat-message"
                          />
                          <Button 
                            type="submit" 
                            className="gradient-primary text-primary-foreground"
                            disabled={!chatMessage.trim()}
                            data-testid="button-send-chat"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="nav-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="gradient-primary text-white">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-strong border-border" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span data-testid="nav-profile">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "creator" && (
                      <DropdownMenuItem asChild>
                        <Link href="/studio" className="w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span data-testid="nav-studio-menu">Studio</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} data-testid="nav-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-foreground hover:text-primary transition-smooth" data-testid="nav-login">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="gradient-primary text-primary-foreground hover-scale transition-smooth" data-testid="nav-get-started">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="nav-mobile-menu"
            >
              <Menu className="text-foreground" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-input/80 backdrop-blur-sm border-border pl-10"
                  data-testid="nav-mobile-search"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </form>

              {/* Mobile Links */}
              <Link href="/">
                <div 
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="nav-mobile-home"
                >
                  Home
                </div>
              </Link>
              <Link href="/discover">
                <div 
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="nav-mobile-discover"
                >
                  Discover
                </div>
              </Link>
              {user?.role === "creator" && (
                <Link href="/studio">
                  <div 
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-mobile-studio"
                  >
                    Studio
                  </div>
                </Link>
              )}
              <Link href="/help">
                <div 
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="nav-mobile-help"
                >
                  Help
                </div>
              </Link>

              {!user && (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/auth">
                    <Button 
                      variant="outline" 
                      className="w-full glass border-border"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="nav-mobile-login"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button 
                      className="w-full gradient-primary text-primary-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="nav-mobile-get-started"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

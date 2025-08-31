import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Rocket, Search, Menu, User, Settings, LogOut } from "lucide-react";

export default function Navigation() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <span className="ml-3 text-xl font-bold text-foreground">Suiciety</span>
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

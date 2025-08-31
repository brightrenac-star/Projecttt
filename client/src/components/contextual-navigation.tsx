import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { useAuth } from "@/hooks/use-auth";
import { usePageContext } from "@/hooks/use-page-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Search, Menu, User, Settings, LogOut, Mail, Send, MessageCircle, Wallet, Heart, Plus } from "lucide-react";
import sLogo from '@assets/generated_images/Blue_rainbow_S_logo_0fa7a8fb.png';
import type { Creator, Conversation, Message } from "@shared/schema";

export default function ContextualNavigation() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { pageType, isOwnCreatorProfile, creatorHandle } = usePageContext();
  const wallet = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const { toast } = useToast();

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

  // Get conversations
  const { data: conversations = [] } = useQuery<Array<Conversation & { otherUser: any; lastMessage?: Message; unreadCount: number }>>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Get messages for selected conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        content: messageContent.trim()
      });
    }
  };

  const formatMessageTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Contextual content based on page type
  const getMiddleContent = () => {
    switch (pageType) {
      case "creator-profile":
        return (
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/discover">
              <span className="text-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="nav-discover">
                Discover
              </span>
            </Link>
          </div>
        );

      case "own-profile-settings":
        return (
          <div className="hidden md:flex items-center space-x-8">
            {user?.role === "creator" && (
              <Link href="/studio">
                <span className="text-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="nav-studio">
                  Studio
                </span>
              </Link>
            )}
          </div>
        );

      case "studio":
      case "studio-data":
        return (
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/studio">
              <span className={`transition-smooth cursor-pointer ${pageType === "studio" ? "text-sui-primary font-medium" : "text-foreground hover:text-sui-primary"}`} data-testid="nav-studio">
                Posts
              </span>
            </Link>
            <Link href="/studio/members">
              <span className="text-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="nav-studio-members">
                Members
              </span>
            </Link>
            <Link href="/studio/settings">
              <span className="text-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="nav-studio-settings">
                Settings
              </span>
            </Link>
          </div>
        );

      case "discover":
        return (
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/discover">
              <span className="text-sui-primary font-medium cursor-pointer" data-testid="nav-discover">
                Discover
              </span>
            </Link>
          </div>
        );

      case "messages":
      case "chat":
        return (
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/messages">
              <span className="text-sui-primary font-medium cursor-pointer" data-testid="nav-messages">
                Messages
              </span>
            </Link>
          </div>
        );

      case "help":
      case "auth":
        return null; // Keep minimal

      default:
        return (
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/discover">
              <span className="text-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="nav-discover">
                Discover
              </span>
            </Link>
            {user?.role === "creator" && (
              <Link href="/studio">
                <span className="text-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="nav-studio">
                  Studio
                </span>
              </Link>
            )}
          </div>
        );
    }
  };

  // Right side content based on auth state and page
  const getRightContent = () => {
    if (!user) {
      return (
        <div className="flex items-center space-x-4">
          <Link href="/auth">
            <Button variant="ghost" className="text-foreground hover:text-sui-primary transition-smooth" data-testid="nav-login">
              Login
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="gradient-sui text-white hover-scale transition-smooth" data-testid="nav-register">
              Register
            </Button>
          </Link>
        </div>
      );
    }

    const showSearch = !["help", "auth", "studio", "studio-data"].includes(pageType);
    const showMessages = !["help", "auth", "studio", "studio-data"].includes(pageType);
    const showWallet = pageType === "creator-profile" && isOwnCreatorProfile;

    return (
      <div className="flex items-center space-x-4">
        {/* Search - contextual */}
        {showSearch && (
          <div className="hidden md:flex items-center max-w-sm">
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
        )}

        {/* Wallet - only on own creator profile */}
        {showWallet && (
          <div className="hidden sm:flex items-center" data-testid="nav-wallet-connect">
            <ConnectButton />
          </div>
        )}

        {/* Messages - contextual */}
        {showMessages && (
          <Sheet open={chatOpen} onOpenChange={setChatOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="relative text-foreground hover:text-sui-primary transition-smooth" data-testid="nav-chat">
                <Mail className="w-4 h-4" />
                {totalUnreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-strong border-border">
              <SheetHeader>
                <SheetTitle className="text-foreground">Messages</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
                {!selectedConversation ? (
                  // Conversation list
                  <ScrollArea className="flex-1 mt-4">
                    <div className="space-y-2 pr-4">
                      {conversations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No conversations yet</p>
                          <p className="text-sm text-muted-foreground">Start chatting with creators and supporters!</p>
                        </div>
                      ) : (
                        conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation.id)}
                            className="flex items-center space-x-3 p-3 glass hover:bg-primary/10 rounded-lg cursor-pointer transition-smooth"
                            data-testid={`conversation-${conversation.id}`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="gradient-sui text-white">
                                {conversation.otherUser.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {conversation.otherUser.displayName}
                                </p>
                                {conversation.lastMessage && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessageTime(conversation.lastMessage.createdAt!)}
                                  </span>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  // Chat view
                  <>
                    <div className="flex items-center space-x-2 mt-4 pb-4 border-b border-border">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        data-testid="button-back-to-conversations"
                      >
                        ← Back
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="gradient-sui text-white">
                            {conversations.find(c => c.id === selectedConversation)?.otherUser.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {conversations.find(c => c.id === selectedConversation)?.otherUser.displayName}
                        </span>
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="space-y-4 pr-4 py-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex flex-col space-y-1 ${
                              message.senderId === user?.id ? 'items-end' : 'items-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.senderId === user?.id
                                  ? 'gradient-sui text-white'
                                  : 'glass text-foreground'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.createdAt!)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="pt-4 border-t border-border">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Textarea
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 min-h-[60px] bg-input/80 backdrop-blur-sm border-border resize-none"
                          data-testid="input-message-content"
                        />
                        <Button 
                          type="submit" 
                          className="gradient-sui text-white"
                          disabled={!messageContent.trim() || sendMessageMutation.isPending}
                          data-testid="button-send-message"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* User Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="nav-user-menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="gradient-sui text-white">
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
      </div>
    );
  };

  return (
    <nav className="glass-strong fixed top-0 left-0 right-0 z-50 border-b border-sui/20" style={{ borderBottomImage: "linear-gradient(90deg, transparent, #00b4d8, transparent)", borderBottomImageSlice: 1 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer" data-testid="nav-logo">
              <div className="gradient-sui p-2 rounded-lg">
                <img src={sLogo} alt="Society" className="w-6 h-6" />
              </div>
              <span className="ml-3 text-xl font-bold text-foreground">Society</span>
            </div>
          </Link>

          {/* Contextual Middle Content */}
          {getMiddleContent()}

          {/* Contextual Right Content */}
          {getRightContent()}

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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search - contextual */}
              {!["help", "auth", "studio", "studio-data"].includes(pageType) && (
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
              )}

              {/* Mobile Links - contextual */}
              {user && (
                <>
                  {pageType === "creator-profile" && isOwnCreatorProfile && (
                    <>
                      <div className="flex items-center px-3 py-2" data-testid="nav-mobile-wallet">
                        <Wallet className="w-4 h-4 mr-2 text-foreground" />
                        <div className="flex-1">
                          <ConnectButton />
                        </div>
                      </div>
                      <Separator className="my-2" />
                    </>
                  )}

                  {!["help", "auth", "studio", "studio-data"].includes(pageType) && (
                    <>
                      <div 
                        className="flex items-center justify-between px-3 py-2 text-base font-medium text-foreground hover:text-sui-primary transition-smooth cursor-pointer"
                        onClick={() => {
                          setChatOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        data-testid="nav-mobile-chat"
                      >
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Messages
                        </div>
                        {totalUnreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                          </Badge>
                        )}
                      </div>
                      <Separator className="my-2" />
                    </>
                  )}
                </>
              )}

              {pageType !== "auth" && pageType !== "help" && (
                <Link href="/discover">
                  <div 
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-sui-primary transition-smooth cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-mobile-discover"
                  >
                    Discover
                  </div>
                </Link>
              )}

              {user?.role === "creator" && !["auth", "help"].includes(pageType) && (
                <Link href="/studio">
                  <div 
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-sui-primary transition-smooth cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-mobile-studio"
                  >
                    Studio
                  </div>
                </Link>
              )}

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
                      className="w-full gradient-sui text-white"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="nav-mobile-register"
                    >
                      Register
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
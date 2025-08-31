import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "../components/navigation";
import Footer from "../components/footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { User, Settings, CreditCard, Shield, ExternalLink, Eye, EyeOff } from "lucide-react";
import type { Creator, Subscription, Tip } from "@shared/schema";

// Form schemas
const updateAccountSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const updateCreatorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(3, "Handle must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Handle can only contain letters, numbers, hyphens, and underscores"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  category: z.string().optional(),
  payoutAddress: z.string().optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  // Get creator profile if user is a creator
  const { data: creator } = useQuery<Creator>({
    queryKey: ["/api/creators", user?.id],
    queryFn: async () => {
      if (user?.role !== "creator") return null;
      const creators = await fetch("/api/creators").then(res => res.json());
      return creators.find((c: Creator) => c.userId === user.id) || null;
    },
    enabled: !!user && user.role === "creator",
  });

  // Get user's subscriptions (for supporters)
  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions", "user", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/user");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  // Account update form
  const accountForm = useForm({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  // Password change form
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Creator profile form
  const creatorForm = useForm({
    resolver: zodResolver(updateCreatorSchema),
    defaultValues: {
      name: creator?.name || "",
      handle: creator?.handle || "",
      bio: creator?.bio || "",
      category: creator?.category || "",
      payoutAddress: creator?.payoutAddress || "",
    },
  });

  // Mutations
  const updateAccountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateAccountSchema>) => {
      const response = await apiRequest("PATCH", "/api/user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Account updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update account", description: error.message, variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
      const response = await apiRequest("PATCH", "/api/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to change password", description: error.message, variant: "destructive" });
    },
  });

  const createCreatorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateCreatorSchema>) => {
      const response = await apiRequest("POST", "/api/creators", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Creator profile created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create creator profile", description: error.message, variant: "destructive" });
    },
  });

  const updateCreatorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateCreatorSchema>) => {
      if (!creator?.id) throw new Error("Creator profile not found");
      const response = await apiRequest("PATCH", `/api/creators/${creator.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Creator profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", user?.id] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update creator profile", description: error.message, variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="flex items-center justify-center py-24">
          <Card className="glass p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Please log in to access your profile.</p>
              <Link href="/auth">
                <Button className="gradient-primary text-primary-foreground" data-testid="button-login">
                  Log In
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-profile">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" data-testid="tab-account">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            {user.role === "creator" && (
              <TabsTrigger value="creator" data-testid="tab-creator">
                <Settings className="w-4 h-4 mr-2" />
                Creator Profile
              </TabsTrigger>
            )}
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
              <CreditCard className="w-4 h-4 mr-2" />
              {user.role === "creator" ? "Earnings" : "Subscriptions"}
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(data => updateAccountMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={accountForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-display-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="gradient-primary text-primary-foreground"
                      disabled={updateAccountMutation.isPending}
                      data-testid="button-update-account"
                    >
                      {updateAccountMutation.isPending ? "Updating..." : "Update Account"}
                    </Button>
                  </form>
                </Form>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Account Status</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Type</span>
                    <Badge variant={user.role === "creator" ? "default" : "secondary"} data-testid="badge-account-type">
                      {user.role === "creator" ? "Creator" : "Supporter"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="text-foreground" data-testid="text-member-since">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(data => changePasswordMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showPassword ? "text" : "password"}
                                data-testid="input-current-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" data-testid="input-new-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" data-testid="input-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="gradient-primary text-primary-foreground"
                      disabled={changePasswordMutation.isPending}
                      data-testid="button-change-password"
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creator Profile Settings */}
          {user.role === "creator" && (
            <TabsContent value="creator">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Creator Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creator ? (
                    <Form {...creatorForm}>
                      <form onSubmit={creatorForm.handleSubmit(data => updateCreatorMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={creatorForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Creator Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-creator-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={creatorForm.control}
                          name="handle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Handle</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="@username" data-testid="input-creator-handle" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={creatorForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Tell supporters about yourself..."
                                  data-testid="textarea-creator-bio"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={creatorForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Digital Artist, Musician" data-testid="input-creator-category" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={creatorForm.control}
                          name="payoutAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SUI Wallet Address</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="0x..." data-testid="input-payout-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="gradient-primary text-primary-foreground"
                          disabled={updateCreatorMutation.isPending}
                          data-testid="button-update-creator"
                        >
                          {updateCreatorMutation.isPending ? "Updating..." : "Update Creator Profile"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You don't have a creator profile yet.</p>
                      <Form {...creatorForm}>
                        <form onSubmit={creatorForm.handleSubmit(data => createCreatorMutation.mutate(data))} className="space-y-4 max-w-md mx-auto">
                          <FormField
                            control={creatorForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Creator Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Your creator name" data-testid="input-new-creator-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={creatorForm.control}
                            name="handle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Handle</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="@username" data-testid="input-new-creator-handle" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={creatorForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Tell supporters about yourself..."
                                    data-testid="textarea-new-creator-bio"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={creatorForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Digital Artist, Musician" data-testid="input-new-creator-category" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="gradient-primary text-primary-foreground w-full"
                            disabled={createCreatorMutation.isPending}
                            data-testid="button-create-creator-profile"
                          >
                            {createCreatorMutation.isPending ? "Creating..." : "Create Creator Profile"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}

                  {creator && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Public Profile</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Profile URL</span>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="text-profile-url">
                              society.com/creator/{creator.handle}
                            </code>
                            <Link href={`/creator/${creator.handle}`}>
                              <Button variant="ghost" size="sm" data-testid="button-view-public-profile">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Subscriptions/Earnings */}
          <TabsContent value="subscriptions">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {user.role === "creator" ? "Earnings Overview" : "My Subscriptions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.role === "creator" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 glass rounded-lg">
                        <div className="text-2xl font-bold text-foreground" data-testid="text-total-earnings">
                          ${((creator?.totalEarnings || 0) / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Earnings</div>
                      </div>
                      <div className="text-center p-4 glass rounded-lg">
                        <div className="text-2xl font-bold text-foreground" data-testid="text-subscriber-count">
                          {creator?.subscriberCount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Subscribers</div>
                      </div>
                      <div className="text-center p-4 glass rounded-lg">
                        <div className="text-2xl font-bold text-foreground" data-testid="text-payout-status">
                          {creator?.payoutAddress ? "✓ Ready" : "⚠ Setup Needed"}
                        </div>
                        <div className="text-sm text-muted-foreground">Payout Status</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Link href="/studio/data">
                        <Button className="gradient-primary text-primary-foreground" data-testid="button-view-analytics">
                          View Detailed Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.length > 0 ? (
                      subscriptions.map((subscription, index) => (
                        <div key={subscription.id} className="glass p-4 rounded-lg" data-testid={`subscription-${index}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-foreground">Subscription #{index + 1}</h4>
                              <p className="text-sm text-muted-foreground">
                                Started {subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : "Recently"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-foreground" data-testid={`subscription-amount-${index}`}>
                                ${(subscription.amount / 100).toFixed(2)}/month
                              </div>
                              <Badge variant={subscription.active ? "default" : "secondary"} data-testid={`subscription-status-${index}`}>
                                {subscription.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You haven't subscribed to any creators yet.</p>
                        <Link href="/discover">
                          <Button className="gradient-primary text-primary-foreground" data-testid="button-discover-creators">
                            Discover Creators
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
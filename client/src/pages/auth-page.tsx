import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Heart, Home } from "lucide-react";
import { SiGoogle, SiDiscord } from "react-icons/si";
import sLogo from '@assets/generated_images/Blue_rainbow_S_logo_0fa7a8fb.png';
import { Redirect } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
    role: "creator",
    termsAccepted: false,
    termsRead: false,
    rememberMe: false,
  });
  const [termsOpen, setTermsOpen] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      loginMutation.mutate(
        { email: formData.email, password: formData.password },
        {
          onSuccess: () => {
            toast({
              title: "Welcome back!",
              description: "You have been successfully logged in.",
            });
            setLocation("/");
          },
        }
      );
    } else {
      if (!formData.termsAccepted) {
        toast({
          title: "Terms Required",
          description: "Please read and accept the terms of service to continue.",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return;
      }

      registerMutation.mutate(
        {
          email: formData.email,
          displayName: formData.displayName,
          password: formData.password,
          role: formData.role,
        },
        {
          onSuccess: () => {
            toast({
              title: "Welcome to Society!",
              description: "Your account has been created successfully.",
            });
            setLocation("/");
          },
        }
      );
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Home Button - Top Left Corner */}
      <Link href="/">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10 glass border-border hover:bg-primary/10 flex items-center gap-2"
          data-testid="button-home-auth"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </Link>
      
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="glass-strong">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="gradient-primary p-3 rounded-lg inline-block mb-4">
                  <img src={sLogo} alt="Society" className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Join Society</h2>
                <p className="text-muted-foreground mt-2">Choose your role and get started</p>
              </div>

              {/* Tab Selection */}
              <div className="flex bg-muted/50 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-smooth ${
                    isLogin ? "gradient-primary text-primary-foreground" : "text-foreground"
                  }`}
                  data-testid="button-login-tab"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-smooth ${
                    !isLogin ? "gradient-primary text-primary-foreground" : "text-foreground"
                  }`}
                  data-testid="button-register-tab"
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection - Only for Register */}
                {!isLogin && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Choose your role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => handleInputChange("role", "creator")}
                        className={`glass rounded-lg p-4 cursor-pointer hover-scale transition-smooth flex flex-col items-center text-center border-2 ${
                          formData.role === "creator" ? "border-primary bg-primary/10" : "border-transparent"
                        }`}
                        data-testid="role-creator"
                      >
                        <Paintbrush className="text-primary text-xl mb-2" />
                        <div className="text-sm font-medium text-foreground">Creator</div>
                        <div className="text-xs text-muted-foreground mt-1">Share content & earn</div>
                      </div>
                      <div
                        onClick={() => handleInputChange("role", "supporter")}
                        className={`glass rounded-lg p-4 cursor-pointer hover-scale transition-smooth flex flex-col items-center text-center border-2 ${
                          formData.role === "supporter" ? "border-primary bg-primary/10" : "border-transparent"
                        }`}
                        data-testid="role-supporter"
                      >
                        <Heart className="text-primary text-xl mb-2" />
                        <div className="text-sm font-medium text-foreground">Supporter</div>
                        <div className="text-xs text-muted-foreground mt-1">Support creators</div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                    data-testid="input-email"
                  />
                </div>

                {/* Display Name - Only for Register */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="display-name" className="block text-sm font-medium text-foreground mb-2">
                      Display Name
                    </Label>
                    <Input
                      type="text"
                      id="display-name"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder="Your display name"
                      required
                      data-testid="input-display-name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    data-testid="input-password"
                  />
                </div>

                {/* Confirm Password - Only for Register */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      id="confirm-password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="••••••••"
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                )}

                {/* Terms for Register, Remember Me for Login */}
                <div className="flex items-center justify-between">
                  {!isLogin ? (
                    <div className="space-y-3 w-full">
                      <div className="flex items-center">
                        <Checkbox
                          id="terms"
                          checked={formData.termsAccepted}
                          onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                          disabled={!formData.termsRead}
                          data-testid="checkbox-terms"
                        />
                        <Label htmlFor="terms" className="ml-2 text-sm text-muted-foreground">
                          I agree to the{" "}
                          <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
                            <DialogTrigger asChild>
                              <span className="text-primary hover:underline cursor-pointer" data-testid="link-terms">
                                Terms of Service
                              </span>
                            </DialogTrigger>
                            <DialogContent className="glass-strong border-border max-w-2xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle className="text-foreground">Terms of Service</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                  Please read our terms of service carefully before proceeding.
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="h-96 pr-4">
                                <div className="space-y-4 text-sm text-foreground">
                                  <section>
                                    <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                                    <p className="text-muted-foreground">
                                      By accessing and using Society, you accept and agree to be bound by the terms and provision of this agreement.
                                    </p>
                                  </section>
                                  <section>
                                    <h3 className="font-semibold mb-2">2. Creator Responsibilities</h3>
                                    <p className="text-muted-foreground">
                                      Creators must provide original content and respect intellectual property rights. All content must comply with community guidelines.
                                    </p>
                                  </section>
                                  <section>
                                    <h3 className="font-semibold mb-2">3. Payment Terms</h3>
                                    <p className="text-muted-foreground">
                                      Society takes a 5% platform fee on all transactions. Payouts are processed weekly. Users are responsible for tax obligations.
                                    </p>
                                  </section>
                                  <section>
                                    <h3 className="font-semibold mb-2">4. Content Policy</h3>
                                    <p className="text-muted-foreground">
                                      Prohibited content includes illegal material, harassment, spam, and copyright infringement. Violations may result in account suspension.
                                    </p>
                                  </section>
                                  <section>
                                    <h3 className="font-semibold mb-2">5. Privacy and Data</h3>
                                    <p className="text-muted-foreground">
                                      We respect your privacy and handle personal data according to our Privacy Policy. User data is encrypted and stored securely.
                                    </p>
                                  </section>
                                </div>
                              </ScrollArea>
                              <div className="flex justify-between items-center pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setTermsOpen(false)}
                                  data-testid="button-close-terms"
                                >
                                  Close
                                </Button>
                                <Button
                                  onClick={() => {
                                    handleInputChange("termsRead", true);
                                    setTermsOpen(false);
                                  }}
                                  className="gradient-primary text-primary-foreground"
                                  data-testid="button-acknowledge-terms"
                                >
                                  I Have Read This
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {" "}and{" "}
                          <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                        </Label>
                      </div>
                      {!formData.termsRead && (
                        <p className="text-xs text-amber-600">Please read the Terms of Service first</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                          data-testid="checkbox-remember"
                        />
                        <Label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                          Remember me
                        </Label>
                      </div>
                      <span className="text-sm text-primary hover:underline cursor-pointer">Forgot password?</span>
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground hover-scale transition-smooth"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  data-testid={isLogin ? "button-sign-in" : "button-create-account"}
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              {/* Social Login Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="glass border-border hover:bg-primary/10"
                    data-testid="button-login-google"
                  >
                    <SiGoogle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="glass border-border hover:bg-primary/10"
                    data-testid="button-login-discord"
                  >
                    <SiDiscord className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="glass border-border hover:bg-primary/10"
                    data-testid="button-login-x"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '-3s' }}></div>
        </div>
        <div className="relative flex items-center justify-center p-12 text-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Welcome to the Future of
              <span className="gradient-primary bg-clip-text text-transparent ml-3">Creator Economy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Connect with supporters, monetize your content, and build lasting relationships in the decentralized creator ecosystem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

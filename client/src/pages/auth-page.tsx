import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Paintbrush, Heart } from "lucide-react";
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
    role: "creator",
    termsAccepted: false,
    rememberMe: false,
  });

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
          description: "Please accept the terms of service to continue.",
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
              title: "Welcome to Suiciety!",
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
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="glass-strong">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="gradient-primary p-3 rounded-lg inline-block mb-4">
                  <Rocket className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Join Suiciety</h2>
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
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => handleInputChange("role", value)}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div>
                        <RadioGroupItem value="creator" id="creator" className="sr-only" />
                        <Label
                          htmlFor="creator"
                          className="glass rounded-lg p-4 cursor-pointer hover-scale transition-smooth flex flex-col items-center text-center"
                          data-testid="role-creator"
                        >
                          <Paintbrush className="text-primary text-xl mb-2" />
                          <div className="text-sm font-medium text-foreground">Creator</div>
                          <div className="text-xs text-muted-foreground mt-1">Share content & earn</div>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="supporter" id="supporter" className="sr-only" />
                        <Label
                          htmlFor="supporter"
                          className="glass rounded-lg p-4 cursor-pointer hover-scale transition-smooth flex flex-col items-center text-center"
                          data-testid="role-supporter"
                        >
                          <Heart className="text-accent text-xl mb-2" />
                          <div className="text-sm font-medium text-foreground">Supporter</div>
                          <div className="text-xs text-muted-foreground mt-1">Support creators</div>
                        </Label>
                      </div>
                    </RadioGroup>
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
                    data-testid="input-password"
                  />
                </div>

                {/* Terms for Register, Remember Me for Login */}
                <div className="flex items-center justify-between">
                  {!isLogin ? (
                    <div className="flex items-center">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                        data-testid="checkbox-terms"
                      />
                      <Label htmlFor="terms" className="ml-2 text-sm text-muted-foreground">
                        I agree to the <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and{" "}
                        <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                      </Label>
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

              <div className="mt-6 text-center">
                <Link href="/discover">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="link-continue-guest">
                    Continue as guest
                  </span>
                </Link>
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

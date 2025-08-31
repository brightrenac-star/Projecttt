import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import AdultVerification from "../components/adult-verification";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AdultVerificationPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="flex items-center justify-center py-24">
          <Card className="glass p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Please log in to access adult verification.</p>
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

  if (user.role !== "creator") {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="flex items-center justify-center py-24">
          <Card className="glass p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Adult verification is only available for creators.</p>
              <Link href="/profile">
                <Button variant="outline" data-testid="button-back-profile">
                  Back to Profile
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
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-verification">
            Adult Content Verification
          </h1>
          <p className="text-muted-foreground">
            Verify your identity to enable posting 18+ content on your creator profile.
          </p>
        </div>

        <AdultVerification 
          onSuccess={() => {
            // Optionally redirect back to profile after successful verification
          }}
        />
      </main>
      
      <Footer />
    </div>
  );
}
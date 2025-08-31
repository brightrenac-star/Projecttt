import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import ProfilePage from "./pages/profile-page";
import StudioPage from "./pages/studio-page";
import StudioDataPage from "./pages/studio-data-page";
import DiscoverPage from "./pages/discover-page";
import HelpPage from "./pages/help-page";
import CreatorProfilePage from "./pages/creator-profile-page";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/creator/:handle" component={CreatorProfilePage} />
      <ProtectedRoute path="/studio/data" component={StudioDataPage} />
      <ProtectedRoute path="/studio" component={StudioPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

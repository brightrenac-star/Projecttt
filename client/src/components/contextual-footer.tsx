import { Link } from "wouter";
import { usePageContext } from "@/hooks/use-page-context";
import { useAuth } from "@/hooks/use-auth";
import sLogo from '@assets/generated_images/Blue_rainbow_S_logo_0fa7a8fb.png';

export default function ContextualFooter() {
  const { pageType } = usePageContext();
  const { user } = useAuth();

  // Get contextual content based on page type
  const getContextualRow = () => {
    switch (pageType) {
      case "creator-profile":
        return (
          <div className="flex justify-center space-x-6 mb-4">
            <a href="mailto:report@society.app" className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-report">
              Report this page
            </a>
            <Link href="/guidelines">
              <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-guidelines">
                Creator guidelines
              </span>
            </Link>
          </div>
        );

      case "own-profile-settings":
        return (
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/help/account">
              <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-account-help">
                Account help
              </span>
            </Link>
          </div>
        );

      case "studio":
      case "studio-data":
        return (
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/docs">
              <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-docs">
                Docs
              </span>
            </Link>
            <Link href="/status">
              <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-status">
                Status
              </span>
            </Link>
          </div>
        );

      case "discover":
        return (
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/help/discover">
              <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-discover-help">
                How Discover works
              </span>
            </Link>
          </div>
        );

      case "help":
        return (
          <div className="flex justify-center space-x-6 mb-4">
            <a href="mailto:support@society.app" className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-contact-support">
              Contact Support
            </a>
          </div>
        );

      case "auth":
        return (
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/why-create-account">
              <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-why-account">
                Why create an account?
              </span>
            </Link>
          </div>
        );

      case "messages":
      case "chat":
        // Messages pages only show rows 2 and 3
        return null;

      default:
        return null;
    }
  };

  return (
    <footer className="glass-strong border-t border-sui/20 mt-auto" style={{ borderTopImage: "linear-gradient(90deg, transparent, #00b4d8, transparent)", borderTopImageSlice: 1 }}>
      {/* Mobile Footer */}
      <div className="md:hidden px-6 py-5">
        <div className="max-w-sm mx-auto">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="gradient-sui p-1.5 rounded-lg">
                <img src={sLogo} alt="Society" className="w-4 h-4" />
              </div>
              <span className="ml-2 text-base font-semibold text-foreground">Society</span>
            </div>
          </div>
          
          {/* Contextual Links - Mobile */}
          {getContextualRow()}
          
          {/* Legal Links */}
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="/terms">
              <span className="text-xs text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="mobile-footer-terms">
                Terms
              </span>
            </Link>
            <Link href="/privacy">
              <span className="text-xs text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="mobile-footer-privacy">
                Privacy
              </span>
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-muted-foreground text-xs">© 2024 Society</p>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contextual Row 1 - Only show if there's contextual content */}
        {getContextualRow()}
        
        {/* Row 2: Legal Links */}
        <div className="flex justify-center space-x-8 mb-4">
          <Link href="/terms">
            <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-terms">
              Terms of Service
            </span>
          </Link>
          <Link href="/privacy">
            <span className="text-sm text-muted-foreground hover:text-sui-primary transition-smooth cursor-pointer" data-testid="footer-privacy">
              Privacy Policy
            </span>
          </Link>
        </div>
        
        {/* Row 3: Meta Info */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8">
          <p className="text-sm text-muted-foreground">© 2024 Society</p>
          {/* Language switch could go here if needed */}
        </div>
      </div>
    </footer>
  );
}
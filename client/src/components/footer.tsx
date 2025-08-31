import { Link } from "wouter";
import sLogo from '@assets/generated_images/Blue_rainbow_S_logo_0fa7a8fb.png';

export default function Footer() {
  return (
    <footer className="glass-strong border-t border-border mt-auto">
      {/* Mobile Footer */}
      <div className="md:hidden px-6 py-5">
        <div className="max-w-sm mx-auto">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="gradient-primary p-1.5 rounded-lg">
                <img src={sLogo} alt="Society" className="w-4 h-4" />
              </div>
              <span className="ml-2 text-base font-semibold text-foreground">Society</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <Link href="/discover">
              <div className="glass-light rounded-lg p-3 hover:bg-primary/10 transition-smooth cursor-pointer" data-testid="mobile-footer-discover">
                <span className="block text-xs font-medium text-foreground mb-1">Discover</span>
                <span className="text-xs text-muted-foreground">Creators</span>
              </div>
            </Link>
            <Link href="/studio">
              <div className="glass-light rounded-lg p-3 hover:bg-primary/10 transition-smooth cursor-pointer" data-testid="mobile-footer-studio">
                <span className="block text-xs font-medium text-foreground mb-1">Studio</span>
                <span className="text-xs text-muted-foreground">Create</span>
              </div>
            </Link>
            <Link href="/help">
              <div className="glass-light rounded-lg p-3 hover:bg-primary/10 transition-smooth cursor-pointer" data-testid="mobile-footer-help">
                <span className="block text-xs font-medium text-foreground mb-1">Help</span>
                <span className="text-xs text-muted-foreground">Support</span>
              </div>
            </Link>
          </div>
          
          {/* Legal Links */}
          <div className="flex justify-center space-x-4 mb-4">
            <span className="text-xs text-muted-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="mobile-footer-terms">
              Terms
            </span>
            <span className="text-xs text-muted-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="mobile-footer-privacy">
              Privacy
            </span>
            <span className="text-xs text-muted-foreground hover:text-primary transition-smooth cursor-pointer" data-testid="mobile-footer-contact">
              Contact
            </span>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-5 mb-3">
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth" data-testid="mobile-footer-twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth" data-testid="mobile-footer-discord">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth" data-testid="mobile-footer-github">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-muted-foreground text-xs">© 2024 Society</p>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="gradient-primary p-2 rounded-lg">
                <img src={sLogo} alt="Society" className="w-6 h-6" />
              </div>
              <span className="ml-3 text-xl font-bold text-foreground">Society</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Empowering creators and supporters to build meaningful connections through content and community.
            </p>
          </div>
          
          {/* Platform */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/discover">
                  <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-discover">
                    Discover
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/studio">
                  <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-studio">
                    Creator Studio
                  </span>
                </Link>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-analytics">
                  Analytics
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-mobile">
                  Mobile App
                </span>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help">
                  <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-help">
                    Help Center
                  </span>
                </Link>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-guidelines">
                  Community Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-contact">
                  Contact Us
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-status">
                  Status
                </span>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-terms">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-privacy">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-cookies">
                  Cookie Policy
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-smooth cursor-pointer" data-testid="footer-dmca">
                  DMCA
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2024 Society. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-smooth"
              data-testid="footer-twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-smooth"
              data-testid="footer-discord"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-smooth"
              data-testid="footer-instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.987 11.988 11.987c6.618 0 11.987-5.369 11.987-11.987C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.724 14.29c-.817-.884-1.297-2.052-1.297-3.323s.48-2.439 1.297-3.323L5.126 6.24c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297L13.174 7.644c.817.884 1.297 2.052 1.297 3.323s-.48 2.439-1.297 3.323L11.772 15.691c-.875.807-2.026 1.297-3.323 1.297z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-smooth"
              data-testid="footer-github"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

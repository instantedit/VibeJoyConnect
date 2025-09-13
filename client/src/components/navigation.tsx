import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Menu, User, LogOut, Settings, Briefcase, Users } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
            <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
              <Brain className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-primary">VibeJoy</h1>
            <span className="bg-accent px-2 py-1 rounded-full text-xs font-medium text-accent-foreground">
              AI-Powered
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className={`transition-colors ${location === '/jobs' ? 'text-primary' : 'text-foreground hover:text-primary'}`} data-testid="nav-jobs">
              Find Jobs
            </Link>
            <Link href="/freelancers" className={`transition-colors ${location === '/freelancers' ? 'text-primary' : 'text-foreground hover:text-primary'}`} data-testid="nav-freelancers">
              Find Talent
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.userType === 'employer' && (
                  <Link href="/post-job" data-testid="nav-post-job">
                    <Button className="bg-primary text-primary-foreground hover:opacity-90">
                      Post a Job
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild data-testid="user-menu-trigger">
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage || undefined} alt={user.username} />
                        <AvatarFallback>
                          {user.firstName ? user.firstName[0] : user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild data-testid="nav-dashboard">
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="nav-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-signin">
                  Sign In
                </Link>
                <Link href="/auth" data-testid="nav-signup">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            <Menu className="text-xl" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border" data-testid="mobile-menu">
            <div className="space-y-4">
              <Link href="/jobs" className="block text-foreground hover:text-primary transition-colors" data-testid="mobile-nav-jobs">
                Find Jobs
              </Link>
              <Link href="/freelancers" className="block text-foreground hover:text-primary transition-colors" data-testid="mobile-nav-freelancers">
                Find Talent
              </Link>
              
              {user ? (
                <>
                  <Link href="/dashboard" className="block text-foreground hover:text-primary transition-colors" data-testid="mobile-nav-dashboard">
                    Dashboard
                  </Link>
                  {user.userType === 'employer' && (
                    <Link href="/post-job" className="block text-foreground hover:text-primary transition-colors" data-testid="mobile-nav-post-job">
                      Post a Job
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left text-foreground hover:text-primary transition-colors"
                    data-testid="mobile-nav-logout"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="block text-foreground hover:text-primary transition-colors" data-testid="mobile-nav-signin">
                    Sign In
                  </Link>
                  <Link href="/auth" className="block text-foreground hover:text-primary transition-colors" data-testid="mobile-nav-signup">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

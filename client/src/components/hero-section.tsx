import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-gradient" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-primary/20" data-testid="ai-badge">
            <Sparkles className="text-primary mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Powered by Advanced AI Matching</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" data-testid="hero-title">
            Find Your Perfect <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Work Match
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="hero-description">
            VibeJoy uses cutting-edge AI to connect employers with freelancers based on skills, 
            experience, and cultural fit. Skip the endless searching – let intelligence do the work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/freelancers" data-testid="button-find-freelancers">
              <Button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg">
                <Search className="mr-2 h-5 w-5" />
                Find Freelancers
              </Button>
            </Link>
            <Link href="/jobs" data-testid="button-browse-jobs">
              <Button variant="outline" className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg border border-primary hover:bg-primary/5 transition-colors">
                <Briefcase className="mr-2 h-5 w-5" />
                Browse Jobs
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto" data-testid="hero-stats">
            <div className="text-center" data-testid="stat-freelancers">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Freelancers</div>
            </div>
            <div className="text-center" data-testid="stat-companies">
              <div className="text-3xl font-bold text-secondary">10K+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center" data-testid="stat-success">
              <div className="text-3xl font-bold text-accent">98%</div>
              <div className="text-sm text-muted-foreground">Match Success</div>
            </div>
            <div className="text-center" data-testid="stat-response">
              <div className="text-3xl font-bold text-primary">24h</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

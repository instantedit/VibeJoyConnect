import { Brain, Rocket, Shield, Check } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white" data-testid="features-section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="features-title">
            Why Choose <span className="text-primary">VibeJoy?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="features-subtitle">
            Our AI-powered platform transforms how freelancers and employers connect, making matches smarter and faster.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* AI Matching */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20 ai-glow" data-testid="feature-ai-matching">
            <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
              <Brain className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4" data-testid="feature-ai-title">Smart AI Matching</h3>
            <p className="text-muted-foreground mb-6" data-testid="feature-ai-description">
              Our advanced algorithms analyze skills, experience, and work style to create perfect matches between freelancers and projects.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2" data-testid="feature-ai-benefit-1">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Skill compatibility analysis</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-ai-benefit-2">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Cultural fit assessment</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-ai-benefit-3">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Project success prediction</span>
              </div>
            </div>
          </div>

          {/* Streamlined Hiring */}
          <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-8 rounded-2xl border border-secondary/20" data-testid="feature-streamlined">
            <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mb-6">
              <Rocket className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4" data-testid="feature-streamlined-title">Streamlined Hiring</h3>
            <p className="text-muted-foreground mb-6" data-testid="feature-streamlined-description">
              Reduce hiring time from weeks to days with automated screening, smart proposals, and integrated communication tools.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2" data-testid="feature-streamlined-benefit-1">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Automated candidate screening</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-streamlined-benefit-2">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Smart proposal generation</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-streamlined-benefit-3">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Integrated messaging system</span>
              </div>
            </div>
          </div>

          {/* Quality Assurance */}
          <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-8 rounded-2xl border border-accent/20" data-testid="feature-quality">
            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-6">
              <Shield className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4" data-testid="feature-quality-title">Quality Guaranteed</h3>
            <p className="text-muted-foreground mb-6" data-testid="feature-quality-description">
              Every freelancer is vetted through our AI-powered assessment system, ensuring you work with top-tier talent.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2" data-testid="feature-quality-benefit-1">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">AI-powered skill verification</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-quality-benefit-2">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Portfolio authenticity check</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-quality-benefit-3">
                <Check className="text-secondary text-sm h-4 w-4" />
                <span className="text-sm">Continuous performance monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

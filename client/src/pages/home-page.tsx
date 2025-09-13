import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { JobCard } from "@/components/job-card";
import { FreelancerCard } from "@/components/freelancer-card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Job, User, FreelancerProfile } from "@shared/schema";
import { Link } from "wouter";
import { Twitter, Linkedin, Github, Brain } from "lucide-react";

export default function HomePage() {
  const { data: featuredJobs } = useQuery<(Job & { employer: User })[]>({
    queryKey: ["/api/jobs?featured=true&limit=3"],
  });

  const { data: topFreelancers } = useQuery<(FreelancerProfile & { user: User })[]>({
    queryKey: ["/api/freelancers?limit=3"],
  });

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Navigation />
      <section id="hero">
        <HeroSection />
      </section>
      <section id="features">
        <FeaturesSection />
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="how-it-works-title">How VibeJoy Works</h2>
            <p className="text-xl text-muted-foreground" data-testid="how-it-works-subtitle">
              Three simple steps to find your perfect match
            </p>
          </div>
          
          {/* For Employers */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center mb-12 text-primary" data-testid="employers-section-title">For Employers</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="employer-step-1">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Post Your Job</h4>
                <p className="text-muted-foreground">
                  Describe your project and let our AI enhance your job posting with intelligent suggestions and optimal formatting.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="employer-step-2">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Get AI Matches</h4>
                <p className="text-muted-foreground">
                  Our AI analyzes thousands of freelancer profiles to present you with the most compatible candidates for your project.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="employer-step-3">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Start Working</h4>
                <p className="text-muted-foreground">
                  Connect directly with your chosen freelancer and begin your project with built-in communication and payment tools.
                </p>
              </div>
            </div>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-12 text-secondary" data-testid="freelancers-section-title">For Freelancers</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="freelancer-step-1">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Create Your Profile</h4>
                <p className="text-muted-foreground">
                  Build a comprehensive profile showcasing your skills, portfolio, and experience with AI-powered optimization suggestions.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="freelancer-step-2">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Receive Smart Matches</h4>
                <p className="text-muted-foreground">
                  Get personalized job recommendations based on your skills, preferences, and past project success patterns.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="freelancer-step-3">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Apply & Win</h4>
                <p className="text-muted-foreground">
                  Submit AI-enhanced proposals that highlight your best qualities and increase your chances of landing the perfect project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section id="featured-jobs" className="py-20 bg-white" data-testid="featured-jobs-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4" data-testid="featured-jobs-title">Featured Jobs</h2>
              <p className="text-xl text-muted-foreground" data-testid="featured-jobs-subtitle">Hand-picked opportunities from top companies</p>
            </div>
            <Link href="/jobs" data-testid="view-all-jobs">
              <Button variant="ghost" className="text-primary font-medium hover:underline">
                View All Jobs →
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="featured-jobs-grid">
            {featuredJobs?.map((job) => (
              <JobCard key={job.id} job={job} aiMatchScore={Math.floor(Math.random() * 20) + 80} />
            )) || (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-6 animate-pulse" data-testid={`job-skeleton-${i}`}>
                  <div className="h-12 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Freelancers Section */}
      <section id="top-freelancers" className="py-20 bg-muted/30" data-testid="top-freelancers-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4" data-testid="top-freelancers-title">Top Freelancers</h2>
              <p className="text-xl text-muted-foreground" data-testid="top-freelancers-subtitle">Connect with vetted professionals ready for your next project</p>
            </div>
            <Link href="/freelancers" data-testid="view-all-talent">
              <Button variant="ghost" className="text-primary font-medium hover:underline">
                View All Talent →
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="top-freelancers-grid">
            {topFreelancers?.map((freelancer) => (
              <FreelancerCard key={freelancer.userId} freelancer={freelancer} />
            )) || (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-6 animate-pulse" data-testid={`freelancer-skeleton-${i}`}>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="cta-title">
            Ready to Transform Your <br />Work Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto" data-testid="cta-description">
            Join VibeJoy today and discover how AI-powered matching can revolutionize the way you find work or hire talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth" data-testid="cta-join-freelancer">
              <Button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg">
                Join as Freelancer
              </Button>
            </Link>
            <Link href="/auth" data-testid="cta-hire-talent">
              <Button className="bg-accent text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent/90 transition-colors shadow-lg">
                Hire Talent Now
              </Button>
            </Link>
          </div>
          <p className="text-white/80 text-sm mt-6" data-testid="cta-terms">Free to join • No credit card required</p>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6" data-testid="footer-logo">
                <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                  <Brain className="text-white" />
                </div>
                <h3 className="text-2xl font-bold">VibeJoy</h3>
              </div>
              <p className="text-white/70 mb-6" data-testid="footer-description">
                AI-powered freelance marketplace connecting talent with opportunity through intelligent matching.
              </p>
              <div className="flex space-x-4" data-testid="footer-social">
                <a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="social-twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="social-linkedin">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="social-github">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div data-testid="footer-freelancers">
              <h4 className="text-lg font-semibold mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/jobs" className="hover:text-white transition-colors" data-testid="footer-find-jobs">Find Jobs</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors" data-testid="footer-create-profile">Create Profile</Link></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-success-stories">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-resources">Resources</a></li>
              </ul>
            </div>
            
            <div data-testid="footer-employers">
              <h4 className="text-lg font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/post-job" className="hover:text-white transition-colors" data-testid="footer-post-job">Post a Job</Link></li>
                <li><Link href="/freelancers" className="hover:text-white transition-colors" data-testid="footer-browse-talent">Browse Talent</Link></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-pricing">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-enterprise">Enterprise</a></li>
              </ul>
            </div>
            
            <div data-testid="footer-company">
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-about">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-careers">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-press">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-contact">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center" data-testid="footer-bottom">
            <p className="text-white/70 text-sm mb-4 md:mb-0" data-testid="footer-copyright">
              © 2024 VibeJoy. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-white/70" data-testid="footer-legal">
              <a href="#" className="hover:text-white transition-colors" data-testid="footer-privacy">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors" data-testid="footer-terms">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors" data-testid="footer-cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

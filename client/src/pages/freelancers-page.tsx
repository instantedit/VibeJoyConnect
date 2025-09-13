import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { FreelancerCard } from "@/components/freelancer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FreelancerProfile, User } from "@shared/schema";
import { Search, Users, Star, MapPin, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const skillOptions = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Django", "PHP", "Laravel",
  "JavaScript", "TypeScript", "HTML", "CSS", "Figma", "Photoshop", "WordPress",
  "SEO", "Content Writing", "Copywriting", "Data Analysis", "Machine Learning",
  "Mobile Development", "UI/UX Design", "Branding", "Video Editing", "3D Modeling"
];

const availabilityOptions = [
  { value: "available", label: "Available Now", color: "text-secondary" },
  { value: "busy", label: "Busy", color: "text-accent" },
  { value: "unavailable", label: "Unavailable", color: "text-muted-foreground" }
];

export default function FreelancersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");

  const { data: freelancers, isLoading, error } = useQuery<(FreelancerProfile & { user: User })[]>({
    queryKey: ["/api/freelancers", { 
      skills: selectedSkills.length > 0 ? selectedSkills.join(",") : undefined,
      limit: 50
    }],
  });

  const filteredFreelancers = freelancers?.filter(freelancer => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        freelancer.user.firstName?.toLowerCase().includes(query) ||
        freelancer.user.lastName?.toLowerCase().includes(query) ||
        freelancer.user.username.toLowerCase().includes(query) ||
        freelancer.title.toLowerCase().includes(query) ||
        freelancer.user.bio?.toLowerCase().includes(query) ||
        freelancer.experience?.toLowerCase().includes(query) ||
        freelancer.skills?.some(skill => skill.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }

    // Rating filter
    if (minRating && minRating !== "all") {
      const rating = parseFloat(freelancer.rating || '0');
      if (rating < parseFloat(minRating)) return false;
    }

    // Availability filter
    if (availability && availability !== "all" && freelancer.availability !== availability) {
      return false;
    }

    return true;
  }) || [];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setMinRating("all");
    setAvailability("all");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="freelancers-page">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16" data-testid="freelancers-header">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="page-title">
              Find Top <span className="text-secondary">Talent</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="page-subtitle">
              Connect with skilled freelancers ready to bring your projects to life.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search freelancers, skills, expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="search-input"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={minRating} onValueChange={setMinRating}>
                      <SelectTrigger data-testid="rating-filter">
                        <SelectValue placeholder="Minimum Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="rating-all">Any Rating</SelectItem>
                        <SelectItem value="4.5" data-testid="rating-4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4.0" data-testid="rating-4.0">4.0+ Stars</SelectItem>
                        <SelectItem value="3.5" data-testid="rating-3.5">3.5+ Stars</SelectItem>
                        <SelectItem value="3.0" data-testid="rating-3.0">3.0+ Stars</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger data-testid="availability-filter">
                        <SelectValue placeholder="Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="availability-all">Any Status</SelectItem>
                        {availabilityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value} data-testid={`availability-${option.value}`}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div></div> {/* Spacer */}

                    <Button variant="outline" onClick={clearFilters} data-testid="clear-filters">
                      Clear Filters
                    </Button>
                  </div>

                  {/* Skills Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" data-testid="skills-label">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map(skill => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => toggleSkill(skill)}
                          data-testid={`skill-filter-${skill}`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Freelancers Results */}
      <section className="py-16" data-testid="freelancers-results">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="results-title">
                {isLoading ? "Loading freelancers..." : `${filteredFreelancers.length} freelancer${filteredFreelancers.length !== 1 ? 's' : ''} found`}
              </h2>
              {(selectedSkills.length > 0 || minRating || availability) && (
                <div className="flex flex-wrap gap-2" data-testid="active-filters">
                  {selectedSkills.map(skill => (
                    <Badge key={skill} variant="secondary" data-testid={`active-filter-skill-${skill}`}>
                      {skill}
                    </Badge>
                  ))}
                  {minRating && (
                    <Badge variant="secondary" data-testid={`active-filter-rating`}>
                      {minRating}+ Stars
                    </Badge>
                  )}
                  {availability && (
                    <Badge variant="secondary" data-testid={`active-filter-availability`}>
                      {availabilityOptions.find(opt => opt.value === availability)?.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="freelancers-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} data-testid={`freelancer-skeleton-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="w-3 h-3 rounded-full" />
                    </div>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 text-center" data-testid="freelancers-error">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Unable to load freelancers</h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the freelancer profiles. Please try again later.
                </p>
                <Button onClick={() => window.location.reload()} data-testid="retry-button">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Freelancers Grid */}
          {!isLoading && !error && (
            <>
              {filteredFreelancers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="freelancers-grid">
                  {filteredFreelancers.map((freelancer) => (
                    <FreelancerCard key={freelancer.userId} freelancer={freelancer} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center" data-testid="freelancers-empty">
                  <CardContent>
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No freelancers found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || selectedSkills.length > 0 || minRating || availability
                        ? "Try adjusting your filters or search terms to find more talent."
                        : "There are no freelancers available at the moment. Check back later for new talent."
                      }
                    </p>
                    {(searchQuery || selectedSkills.length > 0 || minRating || availability) && (
                      <Button onClick={clearFilters} data-testid="clear-filters-empty">
                        Clear All Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Load More Button */}
          {!isLoading && filteredFreelancers.length >= 50 && (
            <div className="text-center mt-12" data-testid="load-more-container">
              <Button variant="outline" size="lg" data-testid="load-more-button">
                Load More Freelancers
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

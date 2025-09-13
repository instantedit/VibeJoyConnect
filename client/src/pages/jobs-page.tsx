import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Job, User } from "@shared/schema";
import { Search, Filter, MapPin, DollarSign, Clock, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "Web Development", "Mobile Development", "Design", "Data Science", "Marketing", 
  "Writing", "Translation", "Video & Audio", "Photography", "Business", "Sales"
];

const skillOptions = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Django", "PHP", "Laravel",
  "JavaScript", "TypeScript", "HTML", "CSS", "Figma", "Photoshop", "WordPress",
  "SEO", "Content Writing", "Copywriting", "Data Analysis", "Machine Learning"
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState<boolean | undefined>(undefined);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { data: jobs, isLoading, error } = useQuery<(Job & { employer: User })[]>({
    queryKey: ["/api/jobs", { 
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      skills: selectedSkills.length > 0 ? selectedSkills.join(",") : undefined,
      remote: remoteOnly,
      featured: featuredOnly || undefined,
      limit: 50
    }],
  });

  const filteredJobs = jobs?.filter(job => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.employer.firstName?.toLowerCase().includes(query) ||
        job.employer.lastName?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
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
    setSelectedCategory("all");
    setSelectedSkills([]);
    setRemoteOnly(undefined);
    setFeaturedOnly(false);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="jobs-page">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16" data-testid="jobs-header">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="page-title">
              Find Your Next <span className="text-primary">Opportunity</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="page-subtitle">
              Discover thousands of jobs posted by companies looking for talent like you.
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
                      placeholder="Search jobs, skills, companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="search-input"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="category-filter">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="category-all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category} data-testid={`category-${category}`}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={remoteOnly?.toString() || "all"} onValueChange={(value) => setRemoteOnly(value === "all" ? undefined : value === "true")}>
                      <SelectTrigger data-testid="location-filter">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="location-all">All Locations</SelectItem>
                        <SelectItem value="true" data-testid="location-remote">Remote Only</SelectItem>
                        <SelectItem value="false" data-testid="location-onsite">On-site Only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={featuredOnly ? "default" : "outline"}
                      onClick={() => setFeaturedOnly(!featuredOnly)}
                      className="justify-start"
                      data-testid="featured-filter"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Featured Only
                    </Button>

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

      {/* Jobs Results */}
      <section className="py-16" data-testid="jobs-results">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="results-title">
                {isLoading ? "Loading jobs..." : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`}
              </h2>
              {(selectedCategory || selectedSkills.length > 0 || remoteOnly !== undefined || featuredOnly) && (
                <div className="flex flex-wrap gap-2" data-testid="active-filters">
                  {selectedCategory && (
                    <Badge variant="secondary" data-testid={`active-filter-category`}>
                      {selectedCategory}
                    </Badge>
                  )}
                  {selectedSkills.map(skill => (
                    <Badge key={skill} variant="secondary" data-testid={`active-filter-skill-${skill}`}>
                      {skill}
                    </Badge>
                  ))}
                  {remoteOnly === true && (
                    <Badge variant="secondary" data-testid="active-filter-remote">
                      Remote Only
                    </Badge>
                  )}
                  {remoteOnly === false && (
                    <Badge variant="secondary" data-testid="active-filter-onsite">
                      On-site Only
                    </Badge>
                  )}
                  {featuredOnly && (
                    <Badge variant="secondary" data-testid="active-filter-featured">
                      Featured Only
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="jobs-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} data-testid={`job-skeleton-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
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
            <Card className="p-8 text-center" data-testid="jobs-error">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Unable to load jobs</h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the job listings. Please try again later.
                </p>
                <Button onClick={() => window.location.reload()} data-testid="retry-button">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Jobs Grid */}
          {!isLoading && !error && (
            <>
              {filteredJobs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="jobs-grid">
                  {filteredJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      aiMatchScore={Math.floor(Math.random() * 20) + 75}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center" data-testid="jobs-empty">
                  <CardContent>
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || selectedCategory || selectedSkills.length > 0 
                        ? "Try adjusting your filters or search terms to find more opportunities."
                        : "There are no jobs available at the moment. Check back later for new opportunities."
                      }
                    </p>
                    {(searchQuery || selectedCategory || selectedSkills.length > 0 || remoteOnly !== undefined || featuredOnly) && (
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
          {!isLoading && filteredJobs.length >= 50 && (
            <div className="text-center mt-12" data-testid="load-more-container">
              <Button variant="outline" size="lg" data-testid="load-more-button">
                Load More Jobs
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

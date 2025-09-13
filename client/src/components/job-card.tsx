import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Brain, Clock, MapPin, DollarSign } from "lucide-react";
import { Job, User } from "@shared/schema";
import { Link } from "wouter";

interface JobCardProps {
  job: Job & { employer: User };
  showApplyButton?: boolean;
  aiMatchScore?: number;
}

export function JobCard({ job, showApplyButton = true, aiMatchScore }: JobCardProps) {
  const formatBudget = (budget: string | null, budgetType: string) => {
    if (!budget) return "Budget TBD";
    const amount = parseFloat(budget);
    if (budgetType === "hourly") {
      return `$${amount}/hr`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getUrgencyBadge = () => {
    if (job.featured) {
      return (
        <Badge variant="secondary" className="bg-accent/10 text-accent" data-testid="badge-featured">
          Featured
        </Badge>
      );
    }
    if (job.urgent) {
      return (
        <Badge className="bg-secondary/10 text-secondary" data-testid="badge-urgent">
          <Clock className="mr-1 h-3 w-3" />
          Urgent
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary" data-testid="badge-new">
        New
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`job-card-${job.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12" data-testid="employer-avatar">
              <AvatarImage src={job.employer.profileImage || undefined} />
              <AvatarFallback>
                {job.employer.firstName ? job.employer.firstName[0] : job.employer.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground" data-testid="employer-name">
                {job.employer.firstName ? `${job.employer.firstName} ${job.employer.lastName || ''}`.trim() : job.employer.username}
              </h4>
              {job.employer.location && (
                <div className="flex items-center text-xs text-muted-foreground" data-testid="employer-location">
                  <MapPin className="mr-1 h-3 w-3" />
                  {job.employer.location}
                </div>
              )}
            </div>
          </div>
          {getUrgencyBadge()}
        </div>

        <Link href={`/jobs/${job.id}`} className="block" data-testid="job-title-link">
          <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors" data-testid="job-title">
            {job.title}
          </h3>
        </Link>

        <p className="text-muted-foreground mb-4 line-clamp-3" data-testid="job-description">
          {job.description}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" data-testid="job-skills">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-primary/10 text-primary text-xs" data-testid={`skill-${skill}`}>
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs" data-testid="skills-more">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-secondary" data-testid="job-budget">
              {formatBudget(job.budget, job.budgetType)}
            </span>
            {job.remote && (
              <Badge variant="outline" className="text-xs" data-testid="badge-remote">
                Remote
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {aiMatchScore && (
              <div className="flex items-center text-sm text-muted-foreground" data-testid="ai-match-score">
                <Brain className="text-primary mr-2 h-4 w-4" />
                {aiMatchScore}% AI Match
              </div>
            )}
            {showApplyButton && (
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" data-testid="button-apply">
                Apply
              </Button>
            )}
          </div>
        </div>

        {(job.applicationsCount ?? 0) > 0 && (
          <div className="mt-3 text-sm text-muted-foreground" data-testid="applications-count">
            {job.applicationsCount} application{job.applicationsCount !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

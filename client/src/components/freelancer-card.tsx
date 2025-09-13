import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Circle } from "lucide-react";
import { FreelancerProfile, User } from "@shared/schema";
import { Link } from "wouter";

interface FreelancerCardProps {
  freelancer: FreelancerProfile & { user: User };
  showContactButton?: boolean;
}

export function FreelancerCard({ freelancer, showContactButton = true }: FreelancerCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-secondary";
      case "busy":
        return "text-accent";
      case "unavailable":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const formatHourlyRate = (rate: string | null) => {
    if (!rate) return "Rate TBD";
    return `$${parseFloat(rate)}/hr`;
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < fullStars ? 'text-accent fill-current' : 'text-muted-foreground'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`freelancer-card-${freelancer.userId}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-16 h-16" data-testid="freelancer-avatar">
            <AvatarImage src={freelancer.user.profileImage || undefined} />
            <AvatarFallback>
              {freelancer.user.firstName ? freelancer.user.firstName[0] : freelancer.user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Link href={`/freelancers/${freelancer.userId}`} className="block" data-testid="freelancer-name-link">
              <h3 className="text-xl font-bold mb-1 hover:text-primary transition-colors" data-testid="freelancer-name">
                {freelancer.user.firstName ? `${freelancer.user.firstName} ${freelancer.user.lastName || ''}`.trim() : freelancer.user.username}
              </h3>
            </Link>
            
            <p className="text-muted-foreground mb-2" data-testid="freelancer-title">
              {freelancer.title}
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center" data-testid="freelancer-rating">
                <div className="flex mr-2">
                  {renderStars(freelancer.rating)}
                </div>
                <span className="text-muted-foreground">
                  {parseFloat(freelancer.rating).toFixed(1)} ({freelancer.completedJobs} reviews)
                </span>
              </div>
            </div>

            {freelancer.user.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1" data-testid="freelancer-location">
                <MapPin className="mr-1 h-3 w-3" />
                {freelancer.user.location}
              </div>
            )}
          </div>
          
          <Circle className={`w-3 h-3 ${getAvailabilityColor(freelancer.availability)} fill-current`} data-testid="availability-indicator" />
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-3" data-testid="freelancer-bio">
          {freelancer.user.bio || freelancer.experience || "Experienced freelancer ready to help with your project."}
        </p>

        {freelancer.skills && freelancer.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" data-testid="freelancer-skills">
            {freelancer.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-secondary/10 text-secondary text-xs" data-testid={`skill-${skill}`}>
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 4 && (
              <Badge variant="outline" className="text-xs" data-testid="skills-more">
                +{freelancer.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-secondary" data-testid="freelancer-rate">
            {formatHourlyRate(freelancer.hourlyRate)}
          </span>
          
          {showContactButton && (
            <Button className="bg-primary text-primary-foreground hover:opacity-90" data-testid="button-contact">
              Contact
            </Button>
          )}
        </div>

        {freelancer.completedJobs > 0 && (
          <div className="mt-3 text-sm text-muted-foreground" data-testid="completed-jobs">
            {freelancer.completedJobs} completed project{freelancer.completedJobs !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

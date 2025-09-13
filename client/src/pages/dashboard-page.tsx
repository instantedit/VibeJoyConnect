import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { JobCard } from "@/components/job-card";
import { FreelancerCard } from "@/components/freelancer-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Job, User, Application, FreelancerProfile } from "@shared/schema";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star, 
  MapPin, 
  Calendar, 
  Clock,
  Edit,
  Plus,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User as UserIcon
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Query for jobs posted by employer
  const { data: myJobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs", "employer", user?.id],
    enabled: user?.userType === "employer",
  });

  // Query for freelancer applications
  const { data: myApplications, isLoading: applicationsLoading } = useQuery<(Application & { job: Job; employer: User })[]>({
    queryKey: ["/api/my-applications"],
    enabled: user?.userType === "freelancer",
  });

  // Query for freelancer profile
  const { data: freelancerProfile, isLoading: profileLoading } = useQuery<FreelancerProfile>({
    queryKey: ["/api/freelancer-profile", user?.id],
    enabled: user?.userType === "freelancer",
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/applications/${applicationId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      toast({
        title: "Application Updated",
        description: "The application status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-accent/10 text-accent";
      case "accepted": return "bg-secondary/10 text-secondary";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "withdrawn": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "withdrawn": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="dashboard-title">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="dashboard-subtitle">
              {user?.userType === "employer" 
                ? "Manage your job postings and find the perfect talent." 
                : "Track your applications and grow your freelance career."
              }
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            {user?.userType === "employer" ? (
              <Link href="/post-job" data-testid="button-post-job">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </Link>
            ) : (
              <Link href="/jobs" data-testid="button-find-jobs">
                <Button className="bg-primary text-primary-foreground">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Find Jobs
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="dashboard-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value={user?.userType === "employer" ? "jobs" : "applications"} data-testid="tab-main">
              {user?.userType === "employer" ? "My Jobs" : "Applications"}
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8" data-testid="overview-content">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {user?.userType === "employer" ? (
                <>
                  <Card data-testid="stat-active-jobs">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Jobs</p>
                          <p className="text-2xl font-bold">
                            {jobsLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              myJobs?.filter(job => job.status === "open").length || 0
                            )}
                          </p>
                        </div>
                        <Briefcase className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-total-applications">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Applications</p>
                          <p className="text-2xl font-bold">
                            {jobsLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              myJobs?.reduce((sum, job) => sum + (job.applicationsCount || 0), 0) || 0
                            )}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-secondary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-completed-jobs">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Completed</p>
                          <p className="text-2xl font-bold">
                            {jobsLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              myJobs?.filter(job => job.status === "completed").length || 0
                            )}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-secondary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-total-spent">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Budget</p>
                          <p className="text-2xl font-bold">
                            {jobsLoading ? (
                              <Skeleton className="h-8 w-16" />
                            ) : (
                              `$${myJobs?.reduce((sum, job) => sum + (job.budget ? parseFloat(job.budget) : 0), 0).toLocaleString() || 0}`
                            )}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card data-testid="stat-active-applications">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Applications</p>
                          <p className="text-2xl font-bold">
                            {applicationsLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              myApplications?.filter(app => app.status === "pending").length || 0
                            )}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-accepted-rate">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                          <p className="text-2xl font-bold">
                            {applicationsLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              myApplications?.length > 0 
                                ? `${Math.round((myApplications.filter(app => app.status === "accepted").length / myApplications.length) * 100)}%`
                                : "0%"
                            )}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-secondary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-profile-rating">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Profile Rating</p>
                          <p className="text-2xl font-bold">
                            {profileLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              parseFloat(freelancerProfile?.rating || "0").toFixed(1)
                            )}
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-completed-projects">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Completed Projects</p>
                          <p className="text-2xl font-bold">
                            {profileLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              freelancerProfile?.completedJobs || 0
                            )}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-secondary" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Recent Activity */}
            <Card data-testid="recent-activity-section">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest {user?.userType === "employer" ? "job postings" : "applications"} and updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.userType === "employer" ? (
                  <div className="space-y-4">
                    {jobsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))
                    ) : myJobs && myJobs.length > 0 ? (
                      myJobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`recent-job-${job.id}`}>
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                              <Briefcase className="text-white h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-medium">{job.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {job.applicationsCount || 0} applications • Posted {new Date(job.createdAt!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8" data-testid="no-jobs-message">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No jobs posted yet. Start by posting your first job!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applicationsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))
                    ) : myApplications && myApplications.length > 0 ? (
                      myApplications.slice(0, 5).map((application) => (
                        <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`recent-application-${application.id}`}>
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                              {getStatusIcon(application.status)}
                            </div>
                            <div>
                              <h4 className="font-medium">{application.job.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Applied {new Date(application.createdAt!).toLocaleDateString()} • {application.employer.firstName || application.employer.username}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8" data-testid="no-applications-message">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No applications yet. Start applying to jobs!</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs/Applications Tab */}
          <TabsContent value={user?.userType === "employer" ? "jobs" : "applications"} className="space-y-8" data-testid="main-content">
            {user?.userType === "employer" ? (
              <Card data-testid="jobs-management-section">
                <CardHeader>
                  <CardTitle>My Job Postings</CardTitle>
                  <CardDescription>
                    Manage your active job postings and view applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobsLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-6">
                          <Skeleton className="h-6 w-3/4 mb-4" />
                          <Skeleton className="h-16 w-full mb-4" />
                          <div className="flex gap-2 mb-4">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : myJobs && myJobs.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {myJobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-6" data-testid={`job-management-${job.id}`}>
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {job.description}
                          </p>
                          
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex justify-between">
                              <span>Applications:</span>
                              <span>{job.applicationsCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Budget:</span>
                              <span>${job.budget ? parseFloat(job.budget).toLocaleString() : 'TBD'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Posted:</span>
                              <span>{new Date(job.createdAt!).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" data-testid={`button-edit-job-${job.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-view-applications-${job.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Applications
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-jobs-empty">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start finding talent by posting your first job.
                      </p>
                      <Link href="/post-job">
                        <Button className="bg-primary text-primary-foreground">
                          <Plus className="mr-2 h-4 w-4" />
                          Post Your First Job
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="applications-management-section">
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>
                    Track your job applications and their status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-16 w-full mb-4" />
                          <Skeleton className="h-8 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : myApplications && myApplications.length > 0 ? (
                    <div className="space-y-4">
                      {myApplications.map((application) => (
                        <div key={application.id} className="border rounded-lg p-6" data-testid={`application-${application.id}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{application.job.title}</h3>
                              <p className="text-muted-foreground">
                                {application.employer.firstName || application.employer.username} • 
                                Applied {new Date(application.createdAt!).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusIcon(application.status)}
                              {application.status}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {application.coverLetter}
                          </p>
                          
                          {application.aiMatchScore && (
                            <div className="flex items-center mb-4">
                              <span className="text-sm text-muted-foreground mr-2">AI Match Score:</span>
                              <Badge variant="outline" className="text-primary">
                                {parseFloat(application.aiMatchScore).toFixed(0)}%
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" data-testid={`button-view-job-${application.job.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Job
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-message-employer-${application.employer.id}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                            {application.status === "pending" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateApplicationMutation.mutate({ applicationId: application.id, status: "withdrawn" })}
                                data-testid={`button-withdraw-${application.id}`}
                              >
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-applications-empty">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start applying to jobs that match your skills and interests.
                      </p>
                      <Link href="/jobs">
                        <Button className="bg-primary text-primary-foreground">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Browse Available Jobs
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8" data-testid="profile-content">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Info */}
              <Card className="md:col-span-2" data-testid="profile-info-section">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your account details and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.profileImage || undefined} />
                      <AvatarFallback className="text-xl">
                        {user?.firstName ? user.firstName[0] : user?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username}
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <Badge variant="outline" className="mt-2">
                        {user?.userType === "employer" ? "Employer" : "Freelancer"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <p className="text-muted-foreground">{user?.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-muted-foreground">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {user?.location && (
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {user.location}
                        </div>
                      </div>
                    )}
                    {user?.website && (
                      <div>
                        <Label className="text-sm font-medium">Website</Label>
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {user?.bio && (
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-muted-foreground mt-1">{user.bio}</p>
                    </div>
                  )}
                  
                  <Button variant="outline" data-testid="button-edit-profile">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Stats */}
              <Card data-testid="profile-stats-section">
                <CardHeader>
                  <CardTitle>
                    {user?.userType === "employer" ? "Hiring Stats" : "Freelancer Stats"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.userType === "freelancer" ? (
                    <>
                      {profileLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : freelancerProfile ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Profile Rating</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-accent mr-1" />
                              <span className="font-medium">{parseFloat(freelancerProfile.rating).toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Completed Jobs</span>
                            <span className="font-medium">{freelancerProfile.completedJobs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Earnings</span>
                            <span className="font-medium">${freelancerProfile.totalEarnings ? parseFloat(freelancerProfile.totalEarnings).toLocaleString() : 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Hourly Rate</span>
                            <span className="font-medium">${freelancerProfile.hourlyRate ? parseFloat(freelancerProfile.hourlyRate) : 0}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Availability</span>
                            <Badge variant="outline" className={
                              freelancerProfile.availability === "available" ? "text-secondary" :
                              freelancerProfile.availability === "busy" ? "text-accent" : 
                              "text-muted-foreground"
                            }>
                              {freelancerProfile.availability}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <UserIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Complete your freelancer profile</p>
                          <Button variant="outline" size="sm" className="mt-2" data-testid="button-complete-profile">
                            Complete Profile
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Jobs Posted</span>
                        <span className="font-medium">{myJobs?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Jobs</span>
                        <span className="font-medium">{myJobs?.filter(job => job.status === "open").length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Applications</span>
                        <span className="font-medium">{myJobs?.reduce((sum, job) => sum + (job.applicationsCount || 0), 0) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed Projects</span>
                        <span className="font-medium">{myJobs?.filter(job => job.status === "completed").length || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

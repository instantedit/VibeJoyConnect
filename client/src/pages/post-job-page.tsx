import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Plus, X, Briefcase, DollarSign, MapPin, Clock, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const categories = [
  "Web Development", "Mobile Development", "Design", "Data Science", "Marketing", 
  "Writing", "Translation", "Video & Audio", "Photography", "Business", "Sales"
];

const skillOptions = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Django", "PHP", "Laravel",
  "JavaScript", "TypeScript", "HTML", "CSS", "Figma", "Photoshop", "WordPress",
  "SEO", "Content Writing", "Copywriting", "Data Analysis", "Machine Learning"
];

const postJobSchema = insertJobSchema.omit({ employerId: true });
type PostJobFormData = z.infer<typeof postJobSchema>;

export default function PostJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const form = useForm<PostJobFormData>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      experience: "intermediate",
      budgetType: "fixed",
      budget: "",
      duration: "",
      skills: [],
      remote: true,
      location: "",
      featured: false,
      urgent: false,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: PostJobFormData) => {
      const res = await apiRequest("POST", "/api/jobs", { ...data, skills: selectedSkills });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted Successfully!",
        description: "Your job has been posted and is now live. You'll start receiving applications soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Post Job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostJobFormData) => {
    createJobMutation.mutate({ ...data, skills: selectedSkills });
  };

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="post-job-page">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 px-4 py-2 rounded-full mb-6" data-testid="ai-enhancement-badge">
            <Sparkles className="text-primary mr-2 h-4 w-4" />
            <span className="text-sm font-medium text-primary">AI-Enhanced Job Posting</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" data-testid="page-title">Post a New Job</h1>
          <p className="text-xl text-muted-foreground" data-testid="page-subtitle">
            Create a compelling job posting and let our AI help you attract the perfect candidates.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card data-testid="basic-info-section">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide the essential details about your job opening.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" data-testid="label-job-title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior React Developer"
                  {...form.register("title")}
                  data-testid="input-job-title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive" data-testid="error-job-title">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" data-testid="label-job-description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements. Our AI will enhance this for you."
                  rows={6}
                  {...form.register("description")}
                  data-testid="input-job-description"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive" data-testid="error-job-description">
                    {form.formState.errors.description.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  💡 Our AI will automatically enhance your description to attract top talent.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" data-testid="label-category">Category *</Label>
                  <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category} data-testid={`category-${category}`}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive" data-testid="error-category">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" data-testid="label-experience">Experience Level *</Label>
                  <Select value={form.watch("experience")} onValueChange={(value) => form.setValue("experience", value as "entry" | "intermediate" | "expert")}>
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry" data-testid="experience-entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate" data-testid="experience-intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert" data-testid="experience-expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.experience && (
                    <p className="text-sm text-destructive" data-testid="error-experience">
                      {form.formState.errors.experience.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Timeline */}
          <Card data-testid="budget-timeline-section">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Budget & Timeline
              </CardTitle>
              <CardDescription>
                Set your budget and project timeline preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budgetType" data-testid="label-budget-type">Budget Type *</Label>
                  <Select value={form.watch("budgetType")} onValueChange={(value) => form.setValue("budgetType", value as "fixed" | "hourly")}>
                    <SelectTrigger data-testid="select-budget-type">
                      <SelectValue placeholder="Select budget type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed" data-testid="budget-fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly" data-testid="budget-hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.budgetType && (
                    <p className="text-sm text-destructive" data-testid="error-budget-type">
                      {form.formState.errors.budgetType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" data-testid="label-budget">
                    Budget ({form.watch("budgetType") === "hourly" ? "$/hour" : "Total $"}) *
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={form.watch("budgetType") === "hourly" ? "50" : "5000"}
                    {...form.register("budget")}
                    data-testid="input-budget"
                  />
                  {form.formState.errors.budget && (
                    <p className="text-sm text-destructive" data-testid="error-budget">
                      {form.formState.errors.budget.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" data-testid="label-duration">Project Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2-3 weeks"
                    {...form.register("duration")}
                    data-testid="input-duration"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Requirements */}
          <Card data-testid="skills-section">
            <CardHeader>
              <CardTitle>Skills & Requirements</CardTitle>
              <CardDescription>
                Specify the skills and expertise required for this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label data-testid="label-skills">Required Skills</Label>
                
                {/* Skill Selection */}
                <div className="flex flex-wrap gap-2" data-testid="skill-options">
                  {skillOptions.map(skill => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => selectedSkills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                      data-testid={`skill-option-${skill}`}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    data-testid="input-custom-skill"
                  />
                  <Button type="button" variant="outline" onClick={addCustomSkill} data-testid="button-add-skill">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Skills */}
                {selectedSkills.length > 0 && (
                  <div className="space-y-2" data-testid="selected-skills">
                    <Label className="text-sm text-muted-foreground">Selected Skills:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map(skill => (
                        <Badge key={skill} className="bg-primary/10 text-primary" data-testid={`selected-skill-${skill}`}>
                          {skill}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location & Preferences */}
          <Card data-testid="location-section">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Location & Preferences
              </CardTitle>
              <CardDescription>
                Set location requirements and job preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={form.watch("remote")}
                  onCheckedChange={(checked) => form.setValue("remote", !!checked)}
                  data-testid="checkbox-remote"
                />
                <Label htmlFor="remote" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remote work allowed
                </Label>
              </div>

              {!form.watch("remote") && (
                <div className="space-y-2">
                  <Label htmlFor="location" data-testid="label-location">Job Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    {...form.register("location")}
                    data-testid="input-location"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={form.watch("featured")}
                    onCheckedChange={(checked) => form.setValue("featured", !!checked)}
                    data-testid="checkbox-featured"
                  />
                  <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Featured job (+$50)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={form.watch("urgent")}
                    onCheckedChange={(checked) => form.setValue("urgent", !!checked)}
                    data-testid="checkbox-urgent"
                  />
                  <Label htmlFor="urgent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Urgent hiring (+$25)
                  </Label>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Featured jobs get 3x more visibility and applications</li>
                  <li>• Urgent jobs appear at the top of search results</li>
                  <li>• Clear skill requirements help attract qualified candidates</li>
                  <li>• Our AI will optimize your job description for better matches</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center" data-testid="submit-section">
            <Button
              type="submit"
              size="lg"
              className="px-12 py-4 text-lg bg-primary text-primary-foreground hover:opacity-90"
              disabled={createJobMutation.isPending}
              data-testid="button-submit-job"
            >
              {createJobMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Posting Job...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Post Job with AI Enhancement
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

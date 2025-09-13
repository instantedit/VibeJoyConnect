import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, Users, Target, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      userType: "freelancer",
      firstName: "",
      lastName: "",
      bio: "",
      location: "",
    },
  });

  // Redirect if already logged in - called after hooks to avoid rules of hooks violation
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" data-testid="auth-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" data-testid="auth-page">
      {/* Left Column - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                <Brain className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-primary">VibeJoy</h1>
            </div>
            <p className="text-muted-foreground">Join the AI-powered freelance revolution</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="auth-tabs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" data-testid="login-form-container">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="login-title">Welcome Back</CardTitle>
                  <CardDescription data-testid="login-description">
                    Sign in to your VibeJoy account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" data-testid="label-login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register("email")}
                        data-testid="input-login-email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive" data-testid="error-login-email">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" data-testid="label-login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                        data-testid="input-login-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive" data-testid="error-login-password">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:opacity-90"
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" data-testid="register-form-container">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="register-title">Create Account</CardTitle>
                  <CardDescription data-testid="register-description">
                    Join VibeJoy and start your journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-type" data-testid="label-user-type">I am a</Label>
                      <Select
                        value={registerForm.watch("userType")}
                        onValueChange={(value) => registerForm.setValue("userType", value as "freelancer" | "employer")}
                      >
                        <SelectTrigger data-testid="select-user-type">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freelancer" data-testid="option-freelancer">Freelancer</SelectItem>
                          <SelectItem value="employer" data-testid="option-employer">Employer</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.userType && (
                        <p className="text-sm text-destructive" data-testid="error-user-type">
                          {registerForm.formState.errors.userType.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name" data-testid="label-first-name">First Name</Label>
                        <Input
                          id="first-name"
                          placeholder="John"
                          {...registerForm.register("firstName")}
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name" data-testid="label-last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          placeholder="Doe"
                          {...registerForm.register("lastName")}
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" data-testid="label-username">Username</Label>
                      <Input
                        id="username"
                        placeholder="johndoe"
                        {...registerForm.register("username")}
                        data-testid="input-username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive" data-testid="error-username">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" data-testid="label-email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...registerForm.register("email")}
                        data-testid="input-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive" data-testid="error-email">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" data-testid="label-password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        {...registerForm.register("password")}
                        data-testid="input-password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive" data-testid="error-password">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" data-testid="label-confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        {...registerForm.register("confirmPassword")}
                        data-testid="input-confirm-password"
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive" data-testid="error-confirm-password">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" data-testid="label-location">Location (Optional)</Label>
                      <Input
                        id="location"
                        placeholder="New York, NY"
                        {...registerForm.register("location")}
                        data-testid="input-location"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" data-testid="label-bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        {...registerForm.register("bio")}
                        data-testid="input-bio"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:opacity-90"
                      disabled={registerMutation.isPending}
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero Content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 items-center justify-center p-8" data-testid="auth-hero">
        <div className="max-w-lg text-center">
          <div className="inline-flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-primary/20">
            <Sparkles className="text-primary mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Powered by AI Matching</span>
          </div>

          <h2 className="text-4xl font-bold mb-6" data-testid="hero-title">
            Join the Future of <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Freelancing
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10" data-testid="hero-description">
            Connect with the perfect opportunities or find top talent using our advanced AI matching technology.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                <Brain className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Smart AI Matching</h3>
                <p className="text-sm text-muted-foreground">Get matched with perfect opportunities</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Users className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Quality Network</h3>
                <p className="text-sm text-muted-foreground">Connect with vetted professionals</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Shield className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Platform</h3>
                <p className="text-sm text-muted-foreground">Safe payments and communications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

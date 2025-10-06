import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import { authApi } from "../../services/api";
import { 
  BarChart3, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  ArrowRight,
  Github,
  Chrome
} from "lucide-react";

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await authApi.login({
        email_or_username: identifier,
        password: password,
      });

      const user = response.token.user;
      const displayName = user.full_name?.trim() || user.username;

      // Transform backend user data to frontend format
      onLogin({
        name: displayName,
        email: user.email,
        avatar: undefined, // Will be set in avatar selection
        role: user.is_admin ? "instructor" : "student",
        notifications: 3, // Mock notifications for now
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    onLogin({
      name: "David Park",
      email: "david.park@email.com",
      avatar: undefined,
      role: "student" as const,
      notifications: 3,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="display-md">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to continue your statistics learning journey
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-card/60 backdrop-blur-sm border border-white/10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email or Username
                </Label>
                <Input
                  id="identifier"
                  name="username"
                  type="text"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-input-background/50 backdrop-blur-sm border-border/50"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input-background/50 backdrop-blur-sm border-border/50 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button 
                type="button" 
                variant="link" 
                className="h-auto p-0 caption-lg text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center caption-lg">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("google")}
                className="bg-card/30 backdrop-blur-sm border-border/50"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("github")}
                className="bg-card/30 backdrop-blur-sm border-border/50"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </Card>

        {/* Switch to Signup */}
        <div className="text-center">
          <p className="caption-lg text-muted-foreground">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="h-auto p-0 caption-lg font-medium text-primary hover:text-primary/80"
              onClick={onSwitchToSignup}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}

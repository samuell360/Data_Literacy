import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { authApi } from "../../services/api";
import { 
  BarChart3, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  User,
  AtSign,
  ArrowRight,
  Github,
  Chrome,
  Check,
  X
} from "lucide-react";

interface SignupProps {
  onSignup: (user: any) => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "Contains uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "Contains lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "Contains number", test: (pwd: string) => /\d/.test(pwd) },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const trimmedFullName = formData.fullName.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedFullName || !trimmedUsername || !trimmedEmail || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (!passwordRequirements.every(req => req.test(formData.password))) {
      setError("Password doesn't meet requirements");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      await authApi.register({
        username: trimmedUsername,
        email: trimmedEmail,
        password: formData.password,
        full_name: trimmedFullName || undefined,
      });

      const loginResponse = await authApi.login({
        email_or_username: trimmedUsername,
        password: formData.password,
      });

      const user = loginResponse.token.user;
      const displayName = user.full_name?.trim() || user.username;

      onSignup({
        name: displayName,
        email: user.email,
        avatar: undefined,
        role: user.is_admin ? "instructor" : "student",
        notifications: 3,
      });
    } catch (err) {
      console.error("Signup failed:", err);
      const message = (
        err instanceof Error && err.message
          ? err.message
          : "Signup failed. Please try again."
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSocialSignup = (provider: string) => {
    // Mock social signup
    onSignup({
      name: "David Park",
      email: "david.park@email.com",
      avatar: undefined,
      role: "student" as const,
      notifications: 3,
    });
  };

  const isPasswordValid = passwordRequirements.every(req => req.test(formData.password));
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="display-md">Create your account</h1>
            <p className="text-muted-foreground mt-2">
              Join thousands of students mastering statistics
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="p-8 bg-card/60 backdrop-blur-sm border border-white/10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName" name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="bg-input-background/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username" name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="bg-input-background/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email" name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-input-background/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password" name="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-input-background/50 backdrop-blur-sm border-border/50 pr-10"
                    required
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="space-y-2 mt-3">
                    <div className="caption-sm text-muted-foreground">Password requirements:</div>
                    <div className="grid grid-cols-1 gap-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {req.test(formData.password) ? (
                            <Check className="w-3 h-3 text-[#10B981]" />
                          ) : (
                            <X className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className={`caption-sm ${
                            req.test(formData.password) 
                              ? "text-[#10B981]" 
                              : "text-muted-foreground"
                          }`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword" name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="bg-input-background/50 backdrop-blur-sm border-border/50 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3 h-3 text-[#10B981]" />
                        <span className="caption-sm text-[#10B981]">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-[#EF4444]" />
                        <span className="caption-sm text-[#EF4444]">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" name="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="caption-lg text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Button variant="link" className="h-auto p-0 caption-lg text-primary hover:text-primary/80">
                  Terms of Service
                </Button>{" "}
                and{" "}
                <Button variant="link" className="h-auto p-0 caption-lg text-primary hover:text-primary/80">
                  Privacy Policy
                </Button>
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !isPasswordValid || !passwordsMatch || !agreeToTerms}
            >
              {isLoading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account
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
                onClick={() => handleSocialSignup("google")}
                className="bg-card/30 backdrop-blur-sm border-border/50"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialSignup("github")}
                className="bg-card/30 backdrop-blur-sm border-border/50"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </Card>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="caption-lg text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="h-auto p-0 caption-lg font-medium text-primary hover:text-primary/80"
              onClick={onSwitchToLogin}
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Also provide a default export to prevent import mismatches during HMR
export default Signup;

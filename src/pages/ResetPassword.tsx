import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ApiError } from "@/types";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // Verify token with GET endpoint
        const response = await api.get(`/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
        
        if (response.data.success) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        
        // Log error for debugging
        console.error('Token validation error:', axiosError.response?.data || axiosError.message);
        
        setIsValid(false);
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "Invalid Reset Link",
          description: axiosError.response?.data?.message || "The password reset link is invalid or has expired.",
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both passwords",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        newPassword: formData.password,
      });

      setSubmitted(true);
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been reset. You can now login with your new password.",
      });

      setTimeout(() => {
        navigate("/student/login");
      }, 3000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;

      let errorMessage = "";
      let shouldRedirect = false;

      if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
        errorMessage = "Request timeout. Server is taking too long to respond. Please try again.";
      } else if (axiosError.response?.data?.error) {
        // Backend returns error field for validation failures
        errorMessage = axiosError.response.data.error;
        
        // Check if it's a token-related error
        if (errorMessage.toLowerCase().includes('invalid') || 
            errorMessage.toLowerCase().includes('expired')) {
          shouldRedirect = true;
        }
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.status === 400) {
        errorMessage = "Invalid or expired reset link. Please request a new one.";
        shouldRedirect = true;
      } else if (axiosError.response?.status === 401) {
        errorMessage = "Reset link has expired. Please request a new one.";
        shouldRedirect = true;
      } else if (axiosError.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = "Failed to reset password. Please try again.";
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });

      // If token is invalid/expired, redirect after showing error
      if (shouldRedirect) {
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4 bg-secondary">
          <Card className="w-full max-w-md shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Validating reset link...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isValid || !token || !email) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4 bg-secondary">
          <Card className="w-full max-w-md shadow-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                The password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  This password reset link is invalid or has expired. Password reset links are valid for 1 hour.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate("/forgot-password")}
                >
                  Request New Reset Link
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/student/login")}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-secondary">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset successfully!
                  </AlertDescription>
                </Alert>

                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>Your password has been reset.</p>
                  <p>Redirecting you to login page...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;

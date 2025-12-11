import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiError } from "@/types";

const TeacherLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
        toast({
          title: "Login successful!",
          description: "Welcome back! Redirecting to your dashboard...",
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: "TEACHER",
        });
        toast({
          title: "Account created!",
          description: "Welcome to EduTech! Redirecting to your dashboard...",
        });
      }
      navigate("/teacher/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Extract error message from various possible response formats
      let errorMessage = "";
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error;
      } else if (axiosError.response?.status === 409) {
        errorMessage = "Email already registered. Please login instead.";
      } else if (axiosError.response?.status === 400) {
        errorMessage = "Please check your input. All fields are required.";
      } else if (axiosError.response?.status === 401) {
        errorMessage = "Invalid email or password.";
      } else {
        errorMessage = isLogin ? "Login failed. Please check your credentials." : "Registration failed. Please try again.";
      }
      
      toast({
        variant: "destructive",
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-secondary">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "Teacher Login" : "Create Teacher Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Welcome back! Login to manage your videos"
                : "Join our community of verified teachers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              {isLogin && (
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Login" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherLogin;

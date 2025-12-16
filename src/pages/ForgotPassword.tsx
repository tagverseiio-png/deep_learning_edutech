import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ApiError } from "@/types";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });

      setSubmitted(true);
      toast({
        title: "Check your email!",
        description: "We've sent a password reset link to your email address.",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;

      let errorMessage = "";
      if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
        errorMessage = "Request timeout. Server is taking too long to respond. Please try again.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else {
        errorMessage = "Failed to send reset email. Please try again.";
      }

      toast({
        variant: "destructive",
        title: "Error",
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
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset link sent successfully!
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-center text-sm text-muted-foreground">
                  <p>Check your email for a link to reset your password.</p>
                  <p className="text-xs">
                    The link will expire in 1 hour for security reasons.
                  </p>
                  <p>
                    Didn't receive an email?{" "}
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setEmail("");
                      }}
                      className="text-accent hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/student/login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    to="/student/login"
                    className="text-accent hover:underline font-medium"
                  >
                    Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateVerificationOrder, useVerifyVerificationPayment, useRazorpayPayment } from "@/hooks/usePayments";
import { useTeacherProfile } from "@/hooks/useTeacher";

const TutorStandPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchaseStatus, setPurchaseStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");

  // Payment hooks
  const createOrderMutation = useCreateVerificationOrder();
  const verifyPaymentMutation = useVerifyVerificationPayment();
  const { initiatePayment } = useRazorpayPayment();

  // Teacher profile hook
  const { data: teacherProfileResponse } = useTeacherProfile();
  const teacherProfile = teacherProfileResponse?.data;

  useEffect(() => {
    // Fetch teacher profile from API
    if (teacherProfile?.isVerified) {
      setPurchaseStatus("verified");
    } else {
      setPurchaseStatus("pending");
    }
  }, [teacherProfile]);

  const handleRazorpayPayment = async () => {
    try {
      // Create verification order through backend (backend uses fixed ₹299)
      const result = await createOrderMutation.mutateAsync({ plan: "verification", amount: 299 });

      const order = result?.data?.order;

      if (!order) {
        throw new Error("Order not returned from server");
      }

      // Initialize Razorpay payment
      await initiatePayment({
        order,
        userInfo: {
          name: teacherProfile?.user?.name || "Teacher",
          email: teacherProfile?.user?.email || "teacher@example.com",
        },
        description: "Teacher Verification Fee",
        onSuccess: async (paymentData) => {
            try {
            // Verify payment on backend
            await verifyPaymentMutation.mutateAsync(paymentData);

            // Don't set verification status locally - server returns it
            // The user object will be updated from API response
            setPurchaseStatus("verified");

            toast({
              title: "Payment Successful!",
              description: "Your teacher account is now verified. You can start creating courses!",
            });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate("/teacher/dashboard");
            }, 2000);
            } catch (error) {
            toast({
              variant: "destructive",
              title: "Payment verification failed",
              description: "Please contact support if amount was deducted.",
            });
          }
        },
        onFailure: (error) => {
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: error.message || "Payment was cancelled or failed.",
          });
        },
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order Creation Failed",
        description: "Failed to create payment order. Please try again.",
      });
    }
  };

  const getStatusBadge = () => {
    switch (purchaseStatus) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending Verification
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/teacher/dashboard")}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Teacher Verification</h1>
            <p className="text-muted-foreground">
              Pay ₹299 to get verified and start creating courses
            </p>
          </div>

          {/* Status Section */}
          {purchaseStatus !== "not_started" && (
            <Card className="mb-6 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Purchase Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                    {getStatusBadge()}
                  </div>
                  {purchaseStatus === "verified" && (
                    <Button onClick={() => navigate("/teacher/dashboard")}>
                      Go to Dashboard
                    </Button>
                  )}
                </div>
                {purchaseStatus === "pending" && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Your purchase is under review. You'll be notified once verified.
                  </p>
                )}
                {purchaseStatus === "rejected" && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Your purchase proof was rejected. Please contact support or try again.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Product Section */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Teacher Verification</CardTitle>
              <CardDescription>Get verified and start your teaching journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Get Verified Instantly</h3>
                    <p className="text-muted-foreground">Pay ₹299 and become a verified teacher</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-primary">₹299</p>
                    <p className="text-sm text-muted-foreground">One-time verification fee</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">What you get:</h4>
                    <p className="text-muted-foreground">
                      Instant verification upon successful payment. No waiting for admin approval or proof submission required.
                    </p>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Instant teacher verification</li>
                      <li>Create and upload courses immediately</li>
                      <li>Earn from student enrollments</li>
                      <li>Access to teacher dashboard</li>
                      <li>Professional teacher status</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          {purchaseStatus !== "verified" && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Teacher Verification Fee
                </CardTitle>
                <CardDescription>Pay ₹299 to get verified and start creating courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Verification Benefits</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Instant verification upon successful payment</li>
                    <li>• Start creating and uploading courses immediately</li>
                    <li>• Earn money from student enrollments</li>
                    <li>• Access to teacher dashboard and analytics</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-green-900">One-time Verification Fee</h3>
                      <p className="text-green-700 text-lg font-bold">₹299</p>
                    </div>
                    <Button
                      id="teacher-buy-btn"
                      onClick={handleRazorpayPayment}
                      disabled={createOrderMutation.isPending}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {createOrderMutation.isPending ? "Creating Order..." : "Pay ₹299 & Get Verified"}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure payment powered by Razorpay • Instant verification upon successful payment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TutorStandPurchase;

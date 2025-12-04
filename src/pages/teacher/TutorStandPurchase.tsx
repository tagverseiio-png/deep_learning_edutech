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
import { useCreateSubscriptionOrder, useVerifySubscriptionPayment, useRazorpayPayment } from "@/hooks/usePayments";
import tutorStandImage from "@/assets/tutor-stand.jpg";

const TutorStandPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchaseStatus, setPurchaseStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Payment hooks
  const createOrderMutation = useCreateSubscriptionOrder();
  const verifyPaymentMutation = useVerifySubscriptionPayment();
  const { initiatePayment } = useRazorpayPayment();

  useEffect(() => {
    // Load purchase status from localStorage
    const status = localStorage.getItem("tutorStandPurchaseStatus") || "not_started";
    setPurchaseStatus(status as any);
    
    const savedScreenshot = localStorage.getItem("tutorStandScreenshot");
    if (savedScreenshot) {
      setPreviewUrl(savedScreenshot);
    }
  }, []);

  const handleRazorpayPayment = async () => {
    try {
      // Create subscription order through backend
      const result = await createOrderMutation.mutateAsync({
        plan: "monthly", // Fixed plan for tutor stand
        amount: 299, // ₹299
      });

      // Backend returns { orderId, amount, currency, keyId } directly in data
      const orderData = result.data;

      // Initialize Razorpay payment
      await initiatePayment({
        order: {
          id: orderData.orderId,
          amount: orderData.amount,
          currency: orderData.currency,
        },
        userInfo: {
          name: "Teacher",
          email: "teacher@example.com",
        },
        description: "Tutor Stand Purchase",
        onSuccess: async (paymentData) => {
          try {
            // Verify payment on backend
            await verifyPaymentMutation.mutateAsync(paymentData);

            // Update local status
            localStorage.setItem("tutorStandPurchaseStatus", "verified");
            setPurchaseStatus("verified");

            toast({
              title: "Payment Successful!",
              description: "Your tutor stand subscription is now active.",
            });
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

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitScreenshot = () => {
    if (!screenshot && !previewUrl) {
      toast({
        title: "Error",
        description: "Please upload a payment screenshot first.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("tutorStandPurchaseStatus", "pending");
    localStorage.setItem("tutorStandScreenshot", previewUrl);
    localStorage.setItem("purchaseDate", new Date().toISOString());
    
    setPurchaseStatus("pending");
    
    toast({
      title: "Screenshot Submitted!",
      description: "Your purchase is pending verification by admin.",
    });
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Purchase Tutor Stand</h1>
            <p className="text-muted-foreground">
              Purchase the Tutor Stand to start uploading educational videos
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
              <CardTitle>Easy Mount Tutor Stand</CardTitle>
              <CardDescription>Professional setup for quality video creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={tutorStandImage} 
                    alt="Easy Mount Tutor Stand" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-primary">₹299</p>
                    <p className="text-sm text-muted-foreground">One-time purchase</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Description:</h4>
                    <p className="text-muted-foreground">
                      The Easy Mount Tutor Stand is a versatile and user-friendly stand designed to 
                      securely hold devices like tablets, phones, or learning machines, making it 
                      ideal for educational environments and online learning sessions. It features 
                      an adjustable, non-slip design that supports a range of device sizes and 
                      provides stable, hands-free access while studying, teaching, or attending 
                      virtual classes.
                    </p>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Adjustable viewing angles</li>
                      <li>Non-slip base for stability</li>
                      <li>Compatible with all phone sizes</li>
                      <li>Lightweight and portable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          {purchaseStatus === "not_started" || purchaseStatus === "rejected" ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Complete Your Purchase
                </CardTitle>
                <CardDescription>Secure payment for your Tutor Stand subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Tutor Stand Benefits</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Easy mount design for quick setup</li>
                    <li>• Professional appearance in online classes</li>
                    <li>• Adjustable height and angle</li>
                    <li>• 24/7 customer support</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-green-900">Monthly Subscription</h3>
                      <p className="text-green-700 text-lg font-bold">₹299/month</p>
                    </div>
                    <Button
                      onClick={handleRazorpayPayment}
                      disabled={createOrderMutation.isPending}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {createOrderMutation.isPending ? "Creating Order..." : "Pay ₹299"}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure payment powered by Razorpay • Instant activation upon successful payment
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TutorStandPurchase;

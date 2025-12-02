import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Video, Star, CheckCircle, XCircle, AlertCircle, ShoppingCart } from "lucide-react";

const TeacherDashboard = () => {
  const [purchaseStatus, setPurchaseStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");

  useEffect(() => {
    // Load purchase status from localStorage
    const status = localStorage.getItem("tutorStandPurchaseStatus") || "not_started";
    setPurchaseStatus(status as any);
  }, []);

  const isPurchaseVerified = purchaseStatus === "verified";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Manage your videos and track your performance</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Tutor Stand Purchase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    {purchaseStatus === "not_started" && (
                      <Badge variant="outline" className="border-red-500 text-red-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Purchased
                      </Badge>
                    )}
                    {purchaseStatus === "pending" && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                    {purchaseStatus === "verified" && (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {purchaseStatus === "rejected" && (
                      <Badge variant="outline" className="border-red-500 text-red-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                  {!isPurchaseVerified && (
                    <Link to="/teacher/purchase-tutor-stand">
                      <Button size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {purchaseStatus === "not_started" ? "Purchase Now" : "View Status"}
                      </Button>
                    </Link>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {purchaseStatus === "not_started" && "Purchase the Tutor Stand to start uploading videos"}
                  {purchaseStatus === "pending" && "Your purchase is under review"}
                  {purchaseStatus === "verified" && "You can now upload videos"}
                  {purchaseStatus === "rejected" && "Your purchase was rejected. Please contact support"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Referral Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Your referral has been verified
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          {!isPurchaseVerified && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Note:</strong> You must purchase the Tutor Stand before uploading videos. 
                    {purchaseStatus === "not_started" && " Click 'Purchase Now' to get started."}
                    {purchaseStatus === "pending" && " Your purchase is under verification."}
                    {purchaseStatus === "rejected" && " Please contact support or try purchasing again."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/teacher/purchase-tutor-stand" className="block">
              <Card className="shadow-card hover:shadow-soft transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Purchase Stand</h3>
                  <p className="text-sm text-muted-foreground">
                    {purchaseStatus === "not_started" ? "Buy Tutor Stand" : "View purchase status"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className={`shadow-card ${!isPurchaseVerified ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-soft transition-shadow cursor-pointer'}`}>
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${isPurchaseVerified ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Video className={`h-6 w-6 ${isPurchaseVerified ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-semibold mb-2">Upload Video</h3>
                <p className="text-sm text-muted-foreground">
                  {isPurchaseVerified ? 'Create new content' : 'Available after verification'}
                </p>
              </CardContent>
            </Card>

            <Card className={`shadow-card ${!isPurchaseVerified ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-soft transition-shadow cursor-pointer'}`}>
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${isPurchaseVerified ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Video className={`h-6 w-6 ${isPurchaseVerified ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-semibold mb-2">My Videos</h3>
                <p className="text-sm text-muted-foreground">
                  {isPurchaseVerified ? 'View all your videos' : 'Available after verification'}
                </p>
              </CardContent>
            </Card>

            <Card className={`shadow-card ${!isPurchaseVerified ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-soft transition-shadow cursor-pointer'}`}>
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${isPurchaseVerified ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Star className={`h-6 w-6 ${isPurchaseVerified ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-semibold mb-2">My Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  {isPurchaseVerified ? 'Check your ratings' : 'Available after verification'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;

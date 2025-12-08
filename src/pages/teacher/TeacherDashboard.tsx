import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart,
  BookOpen,
  Users,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Eye,
  Loader2,
  BarChart3,
  Wallet,
} from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { useMyCoursesTeacher } from "@/hooks/useCourses";
import { useTeacherEarnings, useTeacherProfile } from "@/hooks/useTeacher";
import { useAuth } from "@/contexts/AuthContext";

const TeacherDashboard = () => {
  const [purchaseStatus, setPurchaseStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: coursesData, isLoading: isLoadingCourses } = useMyCoursesTeacher();
  const { data: earningsData, isLoading: isLoadingEarnings } = useTeacherEarnings();
  const { data: profileData } = useTeacherProfile();

  const courses = coursesData?.data || [];
  const earnings = earningsData?.data?.earnings || [];
  const totalEarnings = earningsData?.data?.total || 0;
  const teacherProfile = profileData?.data;

  useEffect(() => {
    // Treat server-side verification as the source of truth
    if (teacherProfile?.isVerified) {
      setPurchaseStatus("verified");
    } else {
      setPurchaseStatus("pending");
    }
  }, [teacherProfile]);

  // Teacher verification is ONLY based on successful ₹299 payment
  // This prevents backend inconsistencies from showing false verification status
  const isPurchaseVerified = purchaseStatus === "verified";

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;
  const totalStudents = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalReviews = courses.reduce((sum, c) => sum + (c._count?.reviews || 0), 0);
  
  const recentCourses = courses.slice(0, 3);
  const recentEarnings = earnings.slice(0, 5);

  const isLoading = isLoadingCourses || isLoadingEarnings;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Teacher'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your courses
              </p>
            </div>
            <Link to="/teacher/create-course">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create New Course
              </Button>
            </Link>
          </div>

          {/* Purchase Status Alert */}
          {!isPurchaseVerified && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex gap-3 flex-1">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Complete Your Setup</p>
                      <p className="text-sm text-muted-foreground">
                        {purchaseStatus === "not_started" && "Complete your ₹299 payment to get verified and start uploading courses."}
                        {purchaseStatus === "pending" && "Your payment is being processed. You'll be verified automatically once confirmed."}
                        {purchaseStatus === "rejected" && "Your payment was not processed. Please try purchasing again."}
                      </p>
                    </div>
                  </div>
                  <Link to="/teacher/purchase-tutor-stand">
                    <Button>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {purchaseStatus === "not_started" ? "Purchase Now" : "View Status"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalCourses}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalStudents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `₹${totalEarnings.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalReviews}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Courses */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>
                      {publishedCourses} published, {draftCourses} drafts
                    </CardDescription>
                  </div>
                  <Link to="/teacher/my-courses">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : recentCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No courses yet</p>
                      <Link to="/teacher/create-course">
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Course
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/teacher/edit-course/${course.id}`)}
                        >
                          <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {(course.thumbnail || course.thumbnailImage) ? (
                              <img
                                src={getMediaUrl(course.thumbnail || course.thumbnailImage) || undefined}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{course.title}</h4>
                              <Badge variant={course.isPublished ? "default" : "secondary"} className="text-xs">
                                {course.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {course._count?.enrollments || 0} students
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration} min
                              </span>
                              <span className="font-medium text-primary">
                                ₹{course.price}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/teacher/create-course" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </Link>
                  <Link to="/teacher/my-courses" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Courses
                    </Button>
                  </Link>
                  <Link to="/teacher/earnings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Earnings
                    </Button>
                  </Link>
                  {!isPurchaseVerified && (
                    <Link to="/teacher/purchase-tutor-stand" className="block">
                      <Button variant="outline" className="w-full justify-start text-primary border-primary">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase Tutor Stand
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Recent Earnings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Earnings</CardTitle>
                  <Link to="/teacher/earnings">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : recentEarnings.length === 0 ? (
                    <div className="text-center py-4">
                      <IndianRupee className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No earnings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentEarnings.map((earning) => (
                        <div key={earning.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{earning.course?.title || "Course"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(earning.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="font-semibold text-green-600">
                            +₹{earning.course?.price || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isPurchaseVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tutor Stand</span>
                      <Badge variant={isPurchaseVerified ? "default" : "secondary"}>
                        {isPurchaseVerified ? "Active" : purchaseStatus === "pending" ? "Pending" : "Required"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profile</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Verified
                      </Badge>
                    </div>
                    {!isPurchaseVerified && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Setup Progress</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;

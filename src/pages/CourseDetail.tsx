import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Users, Play, ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import type { ApiError } from "@/types";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  rating: number;
  thumbnail?: string;
  videoUrl?: string;
  createdAt: string;
  teacher: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
    bio?: string;
    qualifications?: string;
    rating: number;
    totalReviews: number;
  };
  _count?: {
    enrollments: number;
  };
}

interface Enrollment {
  id: string;
  progress: number;
  completedAt?: string;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user?.role === "STUDENT") {
        checkEnrollment();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast({
        variant: "destructive",
        title: "Error",
        description: axiosError.response?.data?.message || "Failed to load course",
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await api.get("/enrollments/my-enrollments");
      const userEnrollment = response.data.data.find((e: any) => e.courseId === id);
      if (userEnrollment) {
        setEnrollment(userEnrollment);
      }
    } catch (error) {
      // User not enrolled, that's fine
    }
  };

  const handleEnroll = async () => {
    if (!course || !user) return;

    setEnrolling(true);
    try {
      // Create payment order
      const orderResponse = await api.post("/payments/create-order", {
        courseId: course.id,
        amount: course.price,
      });

      const { order } = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "EduTech Platform",
        description: `Payment for ${course.title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast({
              title: "Payment successful!",
              description: "You are now enrolled in this course.",
            });

            // Check enrollment again
            await checkEnrollment();
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Payment verification failed",
              description: "Please contact support if money was debited.",
            });
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: axiosError.response?.data?.message || "Failed to process enrollment",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleWatchCourse = () => {
    if (enrollment) {
      // Navigate to course player or content
      toast({
        title: "Opening course",
        description: "Course content will be available soon.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course not found</h2>
            <Button onClick={() => navigate("/courses")}>Back to Courses</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isOwnCourse = isTeacher && course.teacher.user.id === user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Thumbnail */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Play className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {isEnrolled && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Button onClick={handleWatchCourse} size="lg">
                        <Play className="mr-2 h-5 w-5" />
                        Continue Watching
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Course Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                      <CardDescription className="text-base">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-accent">{course.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{course.duration} min</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="font-semibold">{course._count?.enrollments || 0}</p>
                    </div>
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">{course.rating?.toFixed(1) || "N/A"}</p>
                    </div>
                    <div className="text-center">
                      <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold">₹{course.price}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isStudent && !isEnrolled && (
                    <Button
                      onClick={handleEnroll}
                      className="w-full"
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Enroll Now - ₹{course.price}
                        </>
                      )}
                    </Button>
                  )}

                  {isEnrolled && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Enrolled in this course</span>
                    </div>
                  )}

                  {isOwnCourse && (
                    <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">This is your course</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Teacher Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={course.teacher.user.profileImage} />
                      <AvatarFallback>
                        {course.teacher.user.firstName[0]}{course.teacher.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {course.teacher.user.firstName} {course.teacher.user.lastName}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{course.teacher.rating?.toFixed(1) || "N/A"}</span>
                        <span className="text-sm text-muted-foreground">
                          ({course.teacher.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {course.teacher.bio && (
                    <p className="text-sm text-muted-foreground mb-3">{course.teacher.bio}</p>
                  )}

                  {course.teacher.qualifications && (
                    <div>
                      <p className="text-sm font-medium mb-1">Qualifications:</p>
                      <p className="text-sm text-muted-foreground">{course.teacher.qualifications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{course.duration} minutes</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">₹{course.price}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
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

export default CourseDetail;
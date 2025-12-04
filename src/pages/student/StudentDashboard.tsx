import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Video, Star, BookMarked, Loader2 } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useStudentDashboardStats } from "@/hooks/useStudent";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch courses with search functionality
  const { data: coursesData, isLoading: coursesLoading } = useCourses(
    searchQuery ? { search: searchQuery, limit: 6 } : { limit: 6 }
  );

  // Fetch real dashboard stats from API
  const { data: statsData, isLoading: statsLoading } = useStudentDashboardStats();

  // Use real stats from API or fallback to zeros
  const stats = statsData?.data || {
    totalEnrollments: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalAssignments: 0,
  };

  const courses = coursesData?.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.firstName || 'Student'}!
            </h1>
            <p className="text-muted-foreground">Explore and learn from quality educational videos</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for videos, topics, or teachers..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stats.totalEnrollments
                      )}
                    </p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Courses</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stats.completedCourses
                      )}
                    </p>
                  </div>
                  <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stats.inProgressCourses
                      )}
                    </p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <BookMarked className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Videos */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Recommended Videos"}
            </h2>
            {coursesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "No courses are available at the moment"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="shadow-card hover:shadow-soft transition-shadow overflow-hidden">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-accent">₹{course.price}</Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <CardDescription>
                        {course.teacher?.user ? 
                          `${course.teacher.user.firstName} ${course.teacher.user.lastName}` : 
                          "Unknown Teacher"
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">{course.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.5</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => window.location.href = `/courses/${course.id}`}>
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;

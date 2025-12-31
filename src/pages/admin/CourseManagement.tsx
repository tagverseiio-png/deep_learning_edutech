import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Trash2, Eye, EyeOff, Plus, Search } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor?: string;
  price: number;
  enrollmentCount?: number;
  isPublished?: boolean;
  rating?: number;
}

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCourses();

      console.log('📋 CourseManagement - Full response:', response);
      
      // Parse response: { success, data: { courses: [...], pagination: {...} } }
      const responseData = (response as any)?.data || {};
      const normalized = responseData?.courses || [];
      
      console.log('📋 CourseManagement - Normalized courses:', normalized);
      setCourses(normalized);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses.',
        variant: 'destructive',
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await adminApi.togglePublishCourse(courseId);
      setCourses(
        courses.map((c) =>
          c.id === courseId ? { ...c, isPublished: !currentStatus } : c
        )
      );
      toast({
        title: 'Success',
        description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully.`,
      });
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      await adminApi.deleteCourse(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
      setDeleteId(null);
      toast({
        title: 'Success',
        description: 'Course deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course.',
        variant: 'destructive',
      });
    }
  };

  const safeCourses = Array.isArray(courses) ? courses : [];

  const filteredCourses = safeCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-2">Manage all courses on the platform</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses List</CardTitle>
          <CardDescription>
            {filteredCourses.length} of {courses.length} courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor || 'N/A'}</TableCell>
                        <TableCell>₹{course.price}</TableCell>
                        <TableCell>{course.enrollmentCount || 0}</TableCell>
                        <TableCell>
                          {course.rating ? `${course.rating.toFixed(1)}★` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={course.isPublished ? 'default' : 'secondary'}
                          >
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

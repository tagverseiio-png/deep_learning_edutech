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
import { Edit2, Trash2, Search, User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentCount: number;
  reviewCount: number;
  joinDate?: string;
  phone?: string;
  interests?: string;
  goals?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStudents = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const response = await adminApi.getStudents({
        page: pageToFetch,
        limit,
        search: debouncedSearch,
      });

      console.log('📋 StudentManagement - Full response:', response);
      
      // Parse response: { success, data: { students: [...], pagination: {...} } }
      const responseData = (response as any)?.data || {};
      const rawStudents = responseData?.students || [];
      
      console.log('📋 StudentManagement - Raw students:', rawStudents);

      const normalized = rawStudents
        .filter(Boolean)
        .map((item: any): Student => {
          const user = item?.user || {};
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

          return {
            id: item?.id || '',
            name: fullName || 'Unknown',
            email: user?.email || 'N/A',
            phone: user?.phoneNumber,
            enrollmentCount: item?._count?.enrollments ?? 0,
            reviewCount: item?._count?.reviews ?? 0,
            joinDate: user?.createdAt || item?.createdAt,
            interests: item?.interests,
            goals: item?.goals,
          };
        })
        .filter((s) => s.id);

      console.log('📋 StudentManagement - Normalized students:', normalized);
      setStudents(normalized);

      const paginationData = responseData?.pagination || {};
      console.log('📋 StudentManagement - Pagination:', paginationData);
      
      setPagination({
        page: pageToFetch,
        limit: Number(paginationData.limit) || limit,
        total: Number(paginationData.total) || normalized.length,
        totalPages: Number(paginationData.pages || paginationData.totalPages) || 1,
      });
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students.',
        variant: 'destructive',
      });
      setStudents([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchStudents(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    try {
      setSavingEdit(true);
      const payload = {
        interests: editingStudent.interests?.trim() || undefined,
        goals: editingStudent.goals?.trim() || undefined,
      };

      await adminApi.updateStudent(editingStudent.id, payload);
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...editingStudent } : s))
      );
      toast({
        title: 'Success',
        description: 'Student updated successfully.',
      });
      setEditingStudent(null);
    } catch (error) {
      console.error('Failed to update student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student.',
        variant: 'destructive',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    try {
      await adminApi.deleteStudent(studentId);
      setStudents(students.filter((s) => s.id !== studentId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setDeleteId(null);
      toast({
        title: 'Success',
        description: 'Student deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student.',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-2">Manage student accounts and enrollments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + (s.enrollmentCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + (s.reviewCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            {pagination.total} students found
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
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.enrollmentCount || 0} courses
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {student.reviewCount || 0} reviews
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.joinDate
                            ? new Date(student.joinDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)} • {pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(Math.max(1, pagination.totalPages), prev + 1))}
                  disabled={pagination.page >= Math.max(1, pagination.totalPages) || loading}
                >
                  Next
                </Button>
              </div>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

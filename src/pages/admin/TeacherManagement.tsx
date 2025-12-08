import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertDialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Clock, Edit2, Trash2, Search } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  coursesCount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'unknown';
  joinDate?: string;
  bio?: string;
  expertise?: string;
  experience?: number;
  education?: string;
  phoneNumber?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTeachers = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const statusParam = selectedTab === 'all' ? '' : selectedTab.toUpperCase();
      const response = await adminApi.getTeachers({
        page: pageToFetch,
        limit,
        status: statusParam,
        search: debouncedSearch,
      });

      const rawTeachers = Array.isArray((response as any)?.data)
        ? (response as any).data
        : Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data?.data)
            ? (response as any).data.data
            : [];

      const normalized = rawTeachers
        .filter(Boolean)
        .map((item: any): Teacher => {
          const user = item?.user || {};
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

          return {
            id: item?.id || user?.id || '',
            name: fullName || 'Unknown',
            email: user?.email || 'N/A',
            coursesCount: item?._count?.courses ?? 0,
            status: ((item?.verificationStatus || 'unknown').toString().toLowerCase()) as Teacher['status'],
            joinDate: user?.createdAt || item?.createdAt,
            bio: item?.bio,
            expertise: item?.expertise,
            experience: typeof item?.experience === 'number' ? item.experience : undefined,
            education: item?.education,
            phoneNumber: user?.phoneNumber,
          };
        })
        .filter((t) => t.id);

      setTeachers(normalized);

      const paginationData = (response as any)?.pagination || (response as any)?.data?.pagination || {};
      setPagination({
        page: pageToFetch,
        limit: Number(paginationData.limit) || limit,
        total: Number(paginationData.total) || normalized.length,
        totalPages: Number(paginationData.totalPages) || 1,
      });
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teachers.',
        variant: 'destructive',
      });
      setTeachers([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [selectedTab, debouncedSearch]);

  useEffect(() => {
    fetchTeachers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedTab, debouncedSearch]);

  const handleVerifyTeacher = async (teacherId: string) => {
    try {
      await adminApi.verifyTeacher(teacherId, 'APPROVED');
      setTeachers(
        teachers.map((t) =>
          t.id === teacherId ? { ...t, status: 'approved' } : t
        )
      );
      toast({
        title: 'Success',
        description: 'Teacher verified successfully.',
      });
      fetchTeachers(page);
    } catch (error) {
      console.error('Failed to verify teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify teacher.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectTeacher = async (teacherId: string) => {
    try {
      await adminApi.verifyTeacher(teacherId, 'REJECTED');
      setTeachers(
        teachers.map((t) =>
          t.id === teacherId ? { ...t, status: 'rejected' } : t
        )
      );
      toast({
        title: 'Success',
        description: 'Teacher application rejected.',
      });
      fetchTeachers(page);
    } catch (error) {
      console.error('Failed to reject teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject teacher.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;

    try {
      setSavingEdit(true);
      const payload = {
        bio: editingTeacher.bio?.trim() || undefined,
        expertise: editingTeacher.expertise?.trim() || undefined,
        experience:
          typeof editingTeacher.experience === 'number'
            ? editingTeacher.experience
            : undefined,
        education: editingTeacher.education?.trim() || undefined,
        verificationStatus:
          editingTeacher.status && editingTeacher.status !== 'unknown'
            ? editingTeacher.status.toUpperCase()
            : undefined,
      };

      await adminApi.updateTeacher(editingTeacher.id, payload);
      setTeachers((prev) =>
        prev.map((t) => (t.id === editingTeacher.id ? { ...t, ...editingTeacher } : t))
      );
      toast({
        title: 'Success',
        description: 'Teacher updated successfully.',
      });
      setEditingTeacher(null);
    } catch (error) {
      console.error('Failed to update teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to update teacher.',
        variant: 'destructive',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (teacherId: string) => {
    try {
      await adminApi.deleteTeacher(teacherId);
      setTeachers(teachers.filter((t) => t.id !== teacherId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setDeleteId(null);
      toast({
        title: 'Success',
        description: 'Teacher deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete teacher.',
        variant: 'destructive',
      });
    }
  };

  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const filteredTeachers = safeTeachers;
  const statusCounts = safeTeachers.reduce(
    (acc, teacher) => {
      const key = (teacher.status || 'unknown') as keyof typeof acc;
      if (acc[key] !== undefined) acc[key] += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, unknown: 0 }
  );

  const statusConfig = {
    pending: {
      badge: <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>,
      color: 'text-yellow-600',
    },
    approved: {
      badge: <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>,
      color: 'text-green-600',
    },
    rejected: {
      badge: <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>,
      color: 'text-red-600',
    },
    unknown: {
      badge: <Badge variant="outline">Unknown</Badge>,
      color: 'text-muted-foreground',
    },
  } as const;

  const TeachersTable = ({ data }: { data: Teacher[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.coursesCount || 0}</TableCell>
                <TableCell>
                  {teacher.joinDate
                    ? new Date(teacher.joinDate).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {
                    statusConfig[
                      (teacher.status || 'unknown').toString().toLowerCase() as keyof typeof statusConfig
                    ]?.badge || statusConfig.unknown.badge
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {teacher.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerifyTeacher(teacher.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectTeacher(teacher.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Dialog
                      open={editingTeacher?.id === teacher.id}
                      onOpenChange={(open) => setEditingTeacher(open ? teacher : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTeacher(teacher)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Teacher</DialogTitle>
                          <DialogDescription>
                            Update teacher profile details.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input value={editingTeacher?.name || 'Unknown'} disabled />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" value={editingTeacher?.email || 'N/A'} disabled />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <Input value={editingTeacher?.phoneNumber || ''} disabled />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Expertise</label>
                            <Input
                              value={editingTeacher?.expertise || ''}
                              onChange={(e) =>
                                setEditingTeacher(
                                  editingTeacher
                                    ? { ...editingTeacher, expertise: e.target.value }
                                    : null
                                )
                              }
                              placeholder="e.g., Python, AI"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                              value={editingTeacher?.bio || ''}
                              onChange={(e) =>
                                setEditingTeacher(
                                  editingTeacher
                                    ? { ...editingTeacher, bio: e.target.value }
                                    : null
                                )
                              }
                              rows={4}
                              placeholder="Short bio"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Experience (years)</label>
                            <Input
                              type="number"
                              value={editingTeacher?.experience ?? ''}
                              onChange={(e) =>
                                setEditingTeacher(
                                  editingTeacher
                                    ? { ...editingTeacher, experience: e.target.value ? Number(e.target.value) : undefined }
                                    : null
                                )
                              }
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Education</label>
                            <Input
                              value={editingTeacher?.education || ''}
                              onChange={(e) =>
                                setEditingTeacher(
                                  editingTeacher
                                    ? { ...editingTeacher, education: e.target.value }
                                    : null
                                )
                              }
                              placeholder="e.g., PhD in Computer Science"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Verification Status</label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              value={(editingTeacher?.status || 'unknown').toUpperCase()}
                              onChange={(e) =>
                                setEditingTeacher(
                                  editingTeacher
                                    ? { ...editingTeacher, status: (e.target.value || 'UNKNOWN').toLowerCase() as Teacher['status'] }
                                    : null
                                )
                              }
                            >
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="UNKNOWN">Unknown</option>
                            </select>
                          </div>
                          <Button className="w-full" onClick={handleSaveEdit} disabled={!editingTeacher || savingEdit}>
                            {savingEdit ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog
                      open={deleteId === teacher.id}
                      onOpenChange={(open) => setDeleteId(open ? teacher.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{teacher.name}"? This action cannot be undone and will remove their courses.
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(teacher.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No teachers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <p className="text-muted-foreground mt-2">Manage teachers and verify applications</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Teachers Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers List</CardTitle>
          <CardDescription>
            {pagination.total} teachers found
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
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-4 flex flex-wrap gap-2">
                <TabsTrigger value="all">
                  All ({pagination.total})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({statusCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({statusCounts.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({statusCounts.rejected})
                </TabsTrigger>
              </TabsList>
              <TabsContent value={selectedTab} className="mt-0">
                <div className="space-y-4">
                  <TeachersTable data={filteredTeachers} />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

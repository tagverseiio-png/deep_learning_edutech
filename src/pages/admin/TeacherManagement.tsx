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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';

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

      console.log('📋 TeacherManagement - Full response:', response);
      
      // Parse response: { success, data: { teachers: [...], pagination: {...} } }
      const responseData = (response as any)?.data || {};
      const rawTeachers = responseData?.teachers || [];
      
      console.log('📋 TeacherManagement - Raw teachers:', rawTeachers);

      const normalized = rawTeachers
        .filter(Boolean)
        .map((item: any): Teacher => {
          const user = item?.user || {};
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

          return {
            id: item?.id || user?.id || '',
            name: fullName || 'Unknown',
            email: user?.email || 'N/A',
            coursesCount: item?._count?.courses ?? item?.courses?.length ?? 0,
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

      console.log('📋 TeacherManagement - Normalized teachers:', normalized);
      setTeachers(normalized);

      const paginationData = responseData?.pagination || {};
      console.log('📋 TeacherManagement - Pagination:', paginationData);
      
      setPagination({
        page: pageToFetch,
        limit: Number(paginationData.limit) || limit,
        total: Number(paginationData.total) || normalized.length,
        totalPages: Number(paginationData.pages || paginationData.totalPages) || 1,
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
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
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

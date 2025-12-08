import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Download, Trash2 } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  purpose: 'teacher_verification' | 'course_enrollment';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  currency?: string;
  userEmail?: string;
  userName?: string;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPayments = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? '' : statusFilter;
      const purposeParam = purposeFilter === 'all' ? '' : purposeFilter;
      const response = await adminApi.getPayments({
        page: pageToFetch,
        limit,
        status: statusParam,
        purpose: purposeParam,
      });

      const rawPayments = Array.isArray((response as any)?.data)
        ? (response as any).data
        : Array.isArray(response)
          ? response
          : [];

      const normalized = rawPayments
        .filter(Boolean)
        .map((item: any): Payment => {
          const student = item?.student;
          const teacher = item?.teacher;
          const user = student?.user || teacher?.user || {};
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

          return {
            id: item?.id || '',
            razorpayOrderId: item?.razorpayOrderId,
            razorpayPaymentId: item?.razorpayPaymentId,
            amount: typeof item?.amount === 'number' ? item.amount : 0,
            currency: item?.currency || 'INR',
            status: (item?.status || 'pending').toLowerCase() as Payment['status'],
            purpose: item?.purpose || 'course_enrollment',
            userEmail: user?.email,
            userName: fullName || user?.email || 'Unknown',
            metadata: item?.metadata,
            createdAt: item?.createdAt,
            updatedAt: item?.updatedAt,
          };
        })
        .filter((p) => p.id);

      setPayments(normalized);

      const paginationData = (response as any)?.pagination || {};
      setPagination({
        page: pageToFetch,
        limit: Number(paginationData.limit) || limit,
        total: Number(paginationData.total) || normalized.length,
        totalPages: Number(paginationData.totalPages) || 1,
      });
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments.',
        variant: 'destructive',
      });
      setPayments([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter, purposeFilter, debouncedSearch]);

  useEffect(() => {
    fetchPayments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, purposeFilter, debouncedSearch]);

  const filteredPayments = payments;

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await adminApi.deletePayment(paymentId);
      setPayments(payments.filter((p) => p.id !== paymentId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setDeleteId(null);
      toast({
        title: 'Success',
        description: 'Payment record deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment record.',
        variant: 'destructive',
      });
    }
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = filteredPayments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const statusConfig = {
    pending: {
      badge: <Badge variant="secondary">Pending</Badge>,
      color: 'text-yellow-600',
    },
    succeeded: {
      badge: <Badge variant="default">Succeeded</Badge>,
      color: 'text-green-600',
    },
    failed: {
      badge: <Badge variant="destructive">Failed</Badge>,
      color: 'text-red-600',
    },
  } as const;

  const purposeConfig = {
    teacher_verification: 'Teacher Verification',
    course_enrollment: 'Course Enrollment',
  } as const;

  const handleExportCSV = () => {
    try {
      const headers = [
        'Order ID',
        'Payment ID',
        'User',
        'Email',
        'Purpose',
        'Amount',
        'Currency',
        'Status',
        'Date',
      ];
      const rows = filteredPayments.map((p) => [
        p.razorpayOrderId || 'N/A',
        p.razorpayPaymentId || 'N/A',
        p.userName || 'Unknown',
        p.userEmail || 'N/A',
        purposeConfig[p.purpose] || p.purpose,
        p.amount,
        p.currency || 'INR',
        p.status,
        new Date(p.createdAt).toLocaleDateString(),
      ]);

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Payments exported successfully.',
      });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to export payments.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-2">Track all payment transactions</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleExportCSV}
          disabled={filteredPayments.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{completedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by student, email, course, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="teacher_verification">Teacher Verification</SelectItem>
                  <SelectItem value="course_enrollment">Course Enrollment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            {pagination.total} transactions found
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
                      <TableHead>Order ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">
                            {payment.razorpayOrderId?.slice(0, 16) || 'N/A'}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {payment.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {purposeConfig[payment.purpose]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{statusConfig[payment.status].badge}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.razorpayPaymentId?.slice(0, 16) || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog
                              open={deleteId === payment.id}
                              onOpenChange={(open) => setDeleteId(open ? payment.id : null)}
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
                                <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this payment record? This action cannot be undone.
                                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                                    <p><strong>Order ID:</strong> {payment.razorpayOrderId || 'N/A'}</p>
                                    <p><strong>Amount:</strong> {payment.currency} {payment.amount}</p>
                                    <p><strong>User:</strong> {payment.userName}</p>
                                  </div>
                                </AlertDialogDescription>
                                <div className="flex justify-end gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePayment(payment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No payments found
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

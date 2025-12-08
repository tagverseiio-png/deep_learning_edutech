import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalUsers?: number;
  totalStudents?: number;
  totalTeachers?: number;
  totalCourses?: number;
  totalRevenue?: number;
  pendingTeachers?: number;
  totalEnrollments?: number;
  recentPayments?: Array<{
    id: string;
    amount: number;
    purpose?: string;
    status: string;
    createdAt: string;
    student?: {
      user: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
    teacher?: {
      user: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      
      // Normalize response - API returns { data: { stats, recentPayments } }
      const data = (response as any)?.data || response;
      const statsData = data?.stats || {};
      const paymentsData = data?.recentPayments || [];

      setStats({
        totalUsers: Number(statsData.totalUsers) || 0,
        totalStudents: Number(statsData.totalStudents) || 0,
        totalTeachers: Number(statsData.totalTeachers) || 0,
        totalCourses: Number(statsData.totalCourses) || 0,
        totalRevenue: Number(statsData.totalRevenue) || 0,
        totalEnrollments: Number(statsData.totalEnrollments) || 0,
        pendingTeachers: Number(statsData.pendingTeachers) || 0,
        recentPayments: paymentsData,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    loading: isLoading,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    loading?: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your platform overview.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          description="Active student accounts"
          loading={loading}
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          icon={BookOpen}
          description="Registered instructors"
          loading={loading}
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          description="Published courses"
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={CreditCard}
          description="Total platform earnings"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total Enrollments"
          value={stats?.totalEnrollments || 0}
          icon={TrendingUp}
          description="Course enrollments"
          loading={loading}
        />
        <StatCard
          title="Pending Teachers"
          value={stats?.pendingTeachers || 0}
          icon={AlertCircle}
          description="Awaiting verification"
          loading={loading}
        />
      </div>

      {/* Recent Payments */}
      {stats?.recentPayments && stats.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>
              Latest {stats.recentPayments.length} payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPayments.map((payment) => {
                const user = payment?.student?.user || payment?.teacher?.user || {};
                const userName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
                
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{userName || user.email || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{payment.amount}</p>
                      <p
                        className={`text-xs ${
                          payment.status === 'succeeded'
                            ? 'text-green-600'
                            : payment.status === 'failed'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                        }`}
                      >
                        {payment.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

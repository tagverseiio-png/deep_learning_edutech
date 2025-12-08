import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Cpu,
  HardDrive,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SystemStats {
  cpu?: number;
  memory?: number;
  disk?: number;
  loadAverage?: number;
  uptime?: number;
  nodeVersion?: string;
  platform?: string;
  freeMemory?: number;
  totalMemory?: number;
  timestamp?: string;
}

export function SystemMonitoring() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSystemStats();
      setStats(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system statistics.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const getStatusColor = (value: number) => {
    if (value < 60) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    unit,
    max = 100,
    loading: isLoading,
  }: {
    title: string;
    value: number | undefined;
    icon: React.ComponentType<{ className?: string }>;
    unit?: string;
    max?: number;
    loading?: boolean;
  }) => {
    const percentage = value !== undefined ? (value / max) * 100 : 0;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-2 w-full" />
            </>
          ) : (
            <>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold">{value?.toFixed(1)}</span>
                {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
              </div>
              {max === 100 && (
                <>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% utilization
                  </p>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const formatUptime = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Real-time system health and performance metrics
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

      {/* System Info */}
      {stats && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Node Version</p>
                <p className="font-medium">{stats.nodeVersion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="font-medium">{stats.platform || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="font-medium">{formatUptime(stats.uptime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Update</p>
                <p className="font-medium text-sm">
                  {lastRefresh?.toLocaleTimeString() || 'Just now'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="CPU Usage"
          value={stats?.cpu}
          icon={Cpu}
          unit="%"
          max={100}
          loading={loading}
        />
        <StatCard
          title="Memory Usage"
          value={stats?.memory}
          icon={Activity}
          unit="%"
          max={100}
          loading={loading}
        />
        <StatCard
          title="Disk Usage"
          value={stats?.disk}
          icon={HardDrive}
          unit="%"
          max={100}
          loading={loading}
        />
        <StatCard
          title="Load Average"
          value={stats?.loadAverage}
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* Memory Details */}
      {stats && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Details</CardTitle>
            <CardDescription>RAM allocation and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm font-bold">
                  {((stats.totalMemory! - stats.freeMemory!) / 1024 / 1024 / 1024).toFixed(2)} GB /{' '}
                  {(stats.totalMemory! / 1024 / 1024 / 1024).toFixed(2)} GB
                </span>
              </div>
              <Progress
                value={(((stats.totalMemory! - stats.freeMemory!) / stats.totalMemory!) * 100)}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">API Server</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">Database Connection</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
          {stats?.cpu && stats.cpu > 80 && (
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">High CPU Usage</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Warning</span>
            </div>
          )}
          {stats?.memory && stats.memory > 80 && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">High Memory Usage</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Warning</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

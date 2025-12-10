import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to specified page
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role authorization if roles are specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const roleRedirect = user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';
    return <Navigate to={roleRedirect} replace />;
  }

  return <>{children}</>;
}

// Higher-order component for teacher routes
export function TeacherRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']} redirectTo="/teacher/login">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for verified teacher routes
// NOTE: Verification should be checked on the server-side via user.verificationStatus
export function VerifiedTeacherRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check server-side verification status, not localStorage
  const isVerified = user?.verificationStatus === 'VERIFIED';

  if (!isVerified) {
    return <Navigate to="/teacher/purchase-tutor-stand" replace />;
  }

  return (
    <TeacherRoute>
      {children}
    </TeacherRoute>
  );
}

// Higher-order component for student routes
export function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']} redirectTo="/student/login">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for admin routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;

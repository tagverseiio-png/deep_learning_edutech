import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { tokenStorage } from '@/lib/api';
import type { User, LoginInput, RegisterInput, AuthResponse, ApiResponse, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        try {
          const response = await api.get<ApiResponse<User>>('/auth/profile');
          setUser(response.data.data);
        } catch (error) {
          // Token invalid - clear it
          tokenStorage.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginInput): Promise<void> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { user, token, refreshToken } = response.data.data;
    
    tokenStorage.setAccessToken(token);
    tokenStorage.setRefreshToken(refreshToken);
    setUser(user);
  };

  const register = async (data: RegisterInput): Promise<void> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, token, refreshToken } = response.data.data;
    
    tokenStorage.setAccessToken(token);
    tokenStorage.setRefreshToken(refreshToken);
    setUser(user);
  };

  const logout = async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();
    
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', error);
    }
    
    tokenStorage.clearTokens();
    // Clear all session-related data on logout
    const keysToRemove = Object.keys(localStorage).filter(
      key => key.startsWith('edutech_') || 
              key.startsWith('tutor') || 
              key === 'purchaseDate'
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setUser(null);
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook to check if user has a specific role
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

// Helper hook to check if user is a teacher
export function useIsTeacher(): boolean {
  return useHasRole(['TEACHER', 'ADMIN']);
}

// Helper hook to check if user is a student
export function useIsStudent(): boolean {
  return useHasRole(['STUDENT']);
}

export default AuthContext;

// User types
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  teacher?: Teacher;
  student?: Student;
}

export interface Teacher {
  id: string;
  userId: string;
  bio?: string;
  specialization: string[];
  qualifications?: string;
  isVerified: boolean;
  tutorStandActive: boolean;
  tutorStandExpiresAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  interests: string[];
  grade?: string;
  school?: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  level?: string;
  price: number;
  duration: number;
  thumbnail?: string;
  thumbnailImage?: string; // Backend uses this field name
  videoUrl?: string;
  isPublished: boolean;
  rating?: number;
  totalEnrollments?: number;
  teacherId: string;
  teacher?: {
    user: Pick<User, 'firstName' | 'lastName' | 'profileImage'>;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    reviews?: number;
  };
}

export interface CourseFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  teacherId?: string;
  page?: number;
  limit?: number;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  thumbnail?: string;
}

// Enrollment types
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  course?: Course;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  courseId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentType: 'COURSE_ENROLLMENT' | 'SUBSCRIPTION';
  createdAt: string;
  course?: Course;
}

export interface CreateOrderInput {
  courseId: string;
  amount: number;
}

export interface CreateSubscriptionOrderInput {
  plan: 'monthly' | 'yearly';
  amount: number;
}

export interface CreateVerificationOrderInput {
  plan: 'verification';
  amount: number;
}

export interface RazorpayVerificationInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Contact types
export interface ContactInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

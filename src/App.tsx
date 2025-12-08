import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeacherRoute, StudentRoute, VerifiedTeacherRoute } from "@/components/ProtectedRoute";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherRegister from "./pages/teacher/TeacherRegister";
import CreateCourse from "./pages/teacher/CreateCourse";
import EditCourse from "./pages/teacher/EditCourse";
import MyCourses from "./pages/teacher/MyCourses";
import TeacherEarnings from "./pages/teacher/TeacherEarnings";
import TutorStandPurchase from "./pages/teacher/TutorStandPurchase";
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { CourseManagement } from "./pages/admin/CourseManagement";
import { TeacherManagement } from "./pages/admin/TeacherManagement";
import { StudentManagement } from "./pages/admin/StudentManagement";
import { PaymentManagement } from "./pages/admin/PaymentManagement";
import { SystemMonitoring } from "./pages/admin/SystemMonitoring";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route
              path="/teacher/dashboard"
              element={
                <TeacherRoute>
                  <TeacherDashboard />
                </TeacherRoute>
              }
            />
            <Route
              path="/teacher/create-course"
              element={
                <VerifiedTeacherRoute>
                  <CreateCourse />
                </VerifiedTeacherRoute>
              }
            />
            <Route
              path="/teacher/upload-proof"
              element={
                <TeacherRoute>
                  <TutorStandPurchase />
                </TeacherRoute>
              }
            />
            <Route
              path="/teacher/purchase-tutor-stand"
              element={
                <TeacherRoute>
                  <TutorStandPurchase />
                </TeacherRoute>
              }
            />
            <Route
              path="/teacher/my-courses"
              element={
                <VerifiedTeacherRoute>
                  <MyCourses />
                </VerifiedTeacherRoute>
              }
            />
            <Route
              path="/teacher/edit-course/:id"
              element={
                <VerifiedTeacherRoute>
                  <EditCourse />
                </VerifiedTeacherRoute>
              }
            />
            <Route
              path="/teacher/earnings"
              element={
                <VerifiedTeacherRoute>
                  <TeacherEarnings />
                </VerifiedTeacherRoute>
              }
            />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route
              path="/student/dashboard"
              element={
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              }
            />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="teachers" element={<TeacherManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="system" element={<SystemMonitoring />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeacherRoute, StudentRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherRegister from "./pages/teacher/TeacherRegister";
import CreateCourse from "./pages/teacher/CreateCourse";
import UploadProof from "./pages/teacher/UploadProof";
import TutorStandPurchase from "./pages/teacher/TutorStandPurchase";
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentDashboard from "./pages/student/StudentDashboard";
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
                <TeacherRoute>
                  <CreateCourse />
                </TeacherRoute>
              }
            />
            <Route
              path="/teacher/upload-proof"
              element={
                <TeacherRoute>
                  <UploadProof />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

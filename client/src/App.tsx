import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/home";
import Courses from "./pages/courses";
import Teachers from "./pages/teachers";
import CourseDetails from "./pages/course-details";
import TeacherProfile from "./pages/teacher-profile";
import Profile from "./pages/profile";
import StudentDashboard from "./pages/dashboard/student";
import TeacherDashboard from "./pages/dashboard/teacher";
import AdminDashboard from "./pages/dashboard/admin";
import { useAuth, AuthProvider } from "./contexts/auth-context";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/";
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <NotFound />;
  }

  return <Component />;
}

// Main application routes
function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetails} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/teachers/:id" component={TeacherProfile} />
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/dashboard/student">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={['student']} />}
      </Route>
      <Route path="/dashboard/teacher">
        {() => <ProtectedRoute component={TeacherDashboard} allowedRoles={['teacher']} />}
      </Route>
      <Route path="/dashboard/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Main app with all providers
function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;

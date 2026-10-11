import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, HOME, useAuth } from "./AuthContext";
import Layout from "./Layout";
import Login from "./pages/Login";
import { AdminDashboard, FacultyDashboard } from "./pages/Dashboards";
import StudentDashboard from "./pages/StudentDashboard";
import { StudentManagement, FacultyManagement, ClassManagement, SubjectManagement } from "./pages/Management";
import MarkAttendance from "./pages/MarkAttendance";
import AttendanceRecords from "./pages/AttendanceRecords";
import AttendanceReports from "./pages/AttendanceReports";

function RequireRole({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? <Outlet /> : <Navigate to={HOME[user.role]} replace />;
}

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? HOME[user.role] : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            <Route element={<RequireRole role="ADMIN" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route path="/admin/faculty" element={<FacultyManagement />} />
              <Route path="/admin/classes" element={<ClassManagement />} />
              <Route path="/admin/subjects" element={<SubjectManagement />} />
              <Route path="/admin/records" element={<AttendanceRecords />} />
              <Route path="/admin/reports" element={<AttendanceReports />} />
            </Route>

            <Route element={<RequireRole role="FACULTY" />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/faculty/mark" element={<MarkAttendance />} />
              <Route path="/faculty/records" element={<AttendanceRecords />} />
              <Route path="/faculty/reports" element={<AttendanceReports />} />
            </Route>

            <Route element={<RequireRole role="STUDENT" />}>
              <Route path="/student" element={<StudentDashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/auth.store"

// Public pages
import LandingPage from "./pages/LandingPage"
import TeacherLogin from "./pages/auth/TeacherLogin"
import TeacherRegister from "./pages/auth/TeacherRegister"
import StudentLogin from "./pages/auth/StudentLogin"
import StudentRegister from "./pages/auth/StudentRegister"

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard"
import ProgramList from "./pages/teacher/ProgramList"
import CreateProgram from "./pages/teacher/CreateProgram"
import SessionList from "./pages/teacher/SessionList"
import CreateSession from "./pages/teacher/CreateSession"
import MonitorSession from "./pages/teacher/MonitorSession"
import Submissions from "./pages/teacher/Submissions"

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard"
import JoinSession from "./pages/student/JoinSession"
import CodeEditor from "./pages/student/CodeEditor"
import SubmissionHistory from "./pages/student/SubmissionHistory"

// Layouts
import TeacherLayout from "./layouts/TeacherLayout"
import StudentLayout from "./layouts/StudentLayout"

function App() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/teacher/register" element={<TeacherRegister />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={isAuthenticated && user?.role === "teacher" ? <TeacherLayout /> : <Navigate to="/teacher/login" />}
      >
        <Route index element={<Navigate to="/teacher/dashboard" />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="programs" element={<ProgramList />} />
        <Route path="programs/new" element={<CreateProgram />} />
        <Route path="sessions" element={<SessionList />} />
        <Route path="sessions/new" element={<CreateSession />} />
        <Route path="monitor/:sessionId" element={<MonitorSession />} />
        <Route path="submissions" element={<Submissions />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={isAuthenticated && user?.role === "student" ? <StudentLayout /> : <Navigate to="/student/login" />}
      >
        <Route index element={<Navigate to="/student/dashboard" />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="join" element={<JoinSession />} />
        <Route path="session/:sessionId" element={<CodeEditor />} />
        <Route path="history" element={<SubmissionHistory />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

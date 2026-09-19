import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import CustomToaster from './components/common/CustomToast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import ProblemCatalog from './pages/ProblemCatalog';
import ProblemDetail from './pages/ProblemDetail';
// Admin components & pages
import { RequireAdmin } from './pages/AdminRoutes';
import Dashboard from './components/admin/Dashboard';
import RevenueReports from './components/admin/RevenueReports';
import PlatformSettings from './components/admin/PlatformSettings';
import CourseManager from './components/admin/CourseManager';
import StudentManager from './components/admin/StudentManager';
import BatchManager from './components/admin/BatchManager';
import CompletedBatches from './components/admin/CompletedBatches';
import FeeManager from './components/admin/FeeManager';
import TestManager from './components/admin/TestManager';
import TestSubmissions from './components/admin/TestSubmissions';
import GradingPanel from './components/admin/GradingPanel';
import CertificateDesigner from './components/admin/CertificateDesigner';
import ProblemManager from './components/admin/ProblemManager';
import AppearancePage from './pages/admin/AppearancePage';
import DataManager from './components/admin/DataManager';
import AdminProfile from './components/admin/AdminProfile';
import ErrorLogsManager from './components/admin/ErrorLogsManager';
import AdminLogin from './pages/AdminLogin';

// Student components
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './components/student/StudentDashboard';
import StudentCourses from './components/student/StudentCourses';
import CodingArena from './components/student/CodingArena';
import PythonIDE from './components/student/PythonIDE';
import StudentAssignments from './components/student/StudentAssignments';
import StudentTests from './components/student/StudentTests';
import StudentFees from './components/student/StudentFees';
import StudentCertificates from './components/student/StudentCertificates';
import StudentProfile from './components/student/StudentProfile';
import ResultPage from './components/student/ResultPage';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('CodeLift Error:', error, info);
    const msg = error?.message || String(error || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Importing a module script failed')
    ) {
      const lastReload = sessionStorage.getItem('codelift_last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('codelift_last_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (_) { }
    window.location.href = `${import.meta.env.BASE_URL}login`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-body, #0F172A)', color: 'var(--text-primary, #F1F5F9)', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: 520, width: '100%', background: 'var(--card-bg, #1E293B)', borderRadius: 20, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', textAlign: 'center', border: '1px solid var(--border-color, #334155)' }}>
            <h5 style={{ fontWeight: 800, color: 'var(--text-primary, #F1F5F9)', marginBottom: 8, marginTop: 12 }}>Something went wrong</h5>
            <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.875rem', marginBottom: 16 }}>
              A temporary data conflict occurred. Resetting will restore fresh seed data.
            </p>
            {this.state.error && (
              <div style={{ textAlign: 'left', marginBottom: 20, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 14px', borderRadius: 8, fontSize: '0.78rem', color: '#f87171', maxHeight: 160, overflowY: 'auto' }}>
                <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{ background: '#15803D', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', flex: 1 }}
              >
                Reset & Reload
              </button>
              <button
                onClick={() => { window.location.href = import.meta.env.BASE_URL; }}
                style={{ background: 'var(--card-bg-alt, #162032)', color: 'var(--text-primary, #F1F5F9)', border: '1px solid var(--border-color, #334155)', borderRadius: 12, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>
                {/* Public Landing & Marketplace Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/problems" element={<ProblemCatalog />} />
                <Route path="/problems/:id" element={<ProblemDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Dashboard */}
                <Route path="/admin" element={<RequireAdmin />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="reports" element={<RevenueReports />} />
                  <Route path="settings" element={<PlatformSettings />} />
                  <Route path="courses" element={<CourseManager />} />
                  <Route path="problems" element={<ProblemManager />} />
                  <Route path="students" element={<StudentManager />} />
                  <Route path="batches" element={<BatchManager />} />
                  <Route path="completed-batches" element={<CompletedBatches />} />
                  <Route path="fees" element={<FeeManager />} />
                  <Route path="tests" element={<TestManager />} />
                  <Route path="test-submissions" element={<TestSubmissions />} />
                  <Route path="assignments" element={<GradingPanel />} />
                  <Route path="grading" element={<GradingPanel />} />
                  <Route path="certificates" element={<CertificateDesigner />} />
                  <Route path="appearance" element={<AppearancePage />} />
                  <Route path="data" element={<DataManager />} />
                  <Route path="data-backup" element={<DataManager />} />
                  <Route path="logs" element={<ErrorLogsManager />} />
                  <Route path="error-logs" element={<ErrorLogsManager />} />
                  <Route path="profile" element={<AdminProfile />} />

                  {/* Backward compatibility redirects */}
                  <Route path="users" element={<Navigate to="/admin/students" replace />} />
                  <Route path="courses-management" element={<Navigate to="/admin/courses" replace />} />
                  <Route path="batches-management" element={<Navigate to="/admin/batches" replace />} />
                  <Route path="finances" element={<Navigate to="/admin/fees" replace />} />
                  <Route path="payments" element={<Navigate to="/admin/fees" replace />} />
                  <Route path="assessments" element={<Navigate to="/admin/tests" replace />} />
                  <Route path="system" element={<Navigate to="/admin/data" replace />} />

                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Student Portal */}
                <Route path="/student" element={<StudentLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentCourses />} />
                  <Route path="arena" element={<ProblemCatalog isStudentView={true} />} />
                  <Route path="arena/:problemId" element={<ProblemDetail />} />
                  <Route path="assignments" element={<StudentAssignments />} />
                  <Route path="tests" element={<StudentTests />} />
                  <Route path="test-result/:attemptId" element={<ResultPage />} />
                  <Route path="fees" element={<StudentFees />} />
                  <Route path="certificates" element={<StudentCertificates />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="appearance" element={<AppearancePage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <CustomToaster />
            </BrowserRouter>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

import React from 'react';
import {
  FiHome,
  FiBarChart2,
  FiSettings,
  FiBook,
  FiUsers,
  FiLayers,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiUpload,
  FiClipboard,
  FiAward,
  FiStar,
  FiDroplet,
  FiDatabase,
  FiBookOpen,
  FiCheckSquare,
  FiCreditCard,
  FiCode,
  FiAlertTriangle
} from 'react-icons/fi';

export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', to: '/admin/dashboard', route: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { id: 'batches', to: '/admin/batches', route: '/admin/batches', icon: <FiLayers />, label: 'Batches' },
  { id: 'students', to: '/admin/students', route: '/admin/students', icon: <FiUsers />, label: 'Students' },
  { id: 'courses', to: '/admin/courses', route: '/admin/courses', icon: <FiBook />, label: 'Courses' },
  { id: 'tests', to: '/admin/tests', route: '/admin/tests', icon: <FiFileText />, label: 'Test Manager' },
  { id: 'test-submissions', to: '/admin/test-submissions', route: '/admin/test-submissions', icon: <FiUpload />, label: 'Test Submissions' },
  { id: 'assignments', to: '/admin/assignments', route: '/admin/assignments', icon: <FiClipboard />, label: 'Assignments' },
  { id: 'problems', to: '/admin/problems', route: '/admin/problems', icon: <FiCode />, label: 'Code Arena' },
  { id: 'fees', to: '/admin/fees', route: '/admin/fees', icon: <FiDollarSign />, label: 'Fee Manager' },
  { id: 'certificates', to: '/admin/certificates', route: '/admin/certificates', icon: <FiAward />, label: 'Certificates' },
  { id: 'reviews', to: '/admin/reviews', route: '/admin/reviews', icon: <FiStar />, label: 'Reviews' },
  { id: 'completed-batches', to: '/admin/completed-batches', route: '/admin/completed-batches', icon: <FiCheckCircle />, label: 'Completed Batches' },
  { id: 'settings', to: '/admin/settings', route: '/admin/settings', icon: <FiSettings />, label: 'Platform Settings' },
  { id: 'reports', to: '/admin/reports', route: '/admin/reports', icon: <FiBarChart2 />, label: 'Revenue Reports' },
  { id: 'data', to: '/admin/data', route: '/admin/data', icon: <FiDatabase />, label: 'Data Backup' },
  { id: 'logs', to: '/admin/logs', route: '/admin/logs', icon: <FiAlertTriangle />, label: 'Error Logs' },
];

export const STUDENT_NAV_ITEMS = [
  { to: '/student/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { to: '/student/courses', icon: <FiBookOpen />, label: 'My Courses' },
  { to: '/student/tests', icon: <FiFileText />, label: 'Tests' },
  { to: '/student/assignments', icon: <FiCheckSquare />, label: 'Assignments' },
  { to: '/student/arena', icon: <FiCode />, label: 'Code Arena' },
  { to: '/student/certificates', icon: <FiAward />, label: 'Certificates' },
  { to: '/student/fees', icon: <FiCreditCard />, label: 'My Fees' },
];

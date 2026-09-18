import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../common/Layout';
import { STUDENT_NAV_ITEMS } from '../../config/navigation';

export default function StudentLayout() {
  const { auth } = useAuth();

  if (!auth || auth.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout
      title="CodeLift"
      brandLink="/student/dashboard"
      items={STUDENT_NAV_ITEMS}
    />
  );
}

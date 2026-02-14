import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../../ui/Layout.jsx';
import RegistrarHome from './RegistrarHome.jsx';
import RegistrarApplications from './RegistrarApplications.jsx';
import RegistrarDisputes from './RegistrarDisputes.jsx';
import RegistrarAnalytics from './RegistrarAnalytics.jsx';

const tabs = [
  { label: 'Overview', to: '', end: true },
  { label: 'Application Inbox', to: 'applications' },
  { label: 'Dispute Inbox', to: 'disputes' },
  { label: 'Analytics', to: 'analytics' }
];

export default function RegistrarDashboard() {
  return (
    <Layout role="registrar" title="Registrar Dashboard" tabs={tabs}>
      <Routes>
        <Route path="/" element={<RegistrarHome />} />
        <Route path="applications" element={<RegistrarApplications />} />
        <Route path="disputes" element={<RegistrarDisputes />} />
        <Route path="analytics" element={<RegistrarAnalytics />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </Layout>
  );
}

import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../../ui/Layout.jsx';
import CitizenHome from './CitizenHome.jsx';
import CitizenApplications from './CitizenApplications.jsx';
import CitizenDisputes from './CitizenDisputes.jsx';

const tabs = [
  { label: 'Overview', to: '', end: true },
  { label: 'Apply', to: 'apply' },
  { label: 'Disputes', to: 'disputes' }
];

export default function CitizenDashboard() {
  return (
    <Layout role="citizen" title="Citizen Dashboard" tabs={tabs}>
      <Routes>
        <Route path="/" element={<CitizenHome />} />
        <Route path="apply" element={<CitizenApplications />} />
        <Route path="disputes" element={<CitizenDisputes />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </Layout>
  );
}

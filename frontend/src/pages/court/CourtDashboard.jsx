import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../../ui/Layout.jsx';
import CourtCases from './CourtCases.jsx';

const tabs = [{ label: 'Cases', to: '', end: true }];

export default function CourtDashboard() {
  return (
    <Layout role="court" title="Court Dashboard" tabs={tabs}>
      <Routes>
        <Route path="/" element={<CourtCases />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </Layout>
  );
}

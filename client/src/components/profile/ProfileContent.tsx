import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Overview from './sections/Overview';
import Settings from './sections/Settings';
import Security from './sections/Security';

export default function ProfileContent() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <Routes location={location}>
        <Route path="/" element={<Overview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/security" element={<Security />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </div>
  );
}

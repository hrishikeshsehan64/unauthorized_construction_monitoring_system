import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Violations from './pages/Violations';
import MapPage from './pages/Map';
import Investigations from './pages/Investigations';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-bg">
        <Header />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <main className="flex-1 min-w-0 p-3 overflow-hidden">
            <ErrorBoundary>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/violations" element={<Violations />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/investigations" element={<Investigations />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </Router>
  );
}

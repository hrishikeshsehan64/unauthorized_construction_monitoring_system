import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { USMSProvider } from './context/USMSContext';
import Header from './components/Header';
import Sites from './pages/Sites';
import Surveys from './pages/Surveys';
import Reports from './pages/Reports';
import Investigations from './pages/Investigations';
import MapPage from './pages/Map';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <Router>
      <USMSProvider>
        <div className="h-screen flex flex-col bg-bg text-ink overflow-hidden">
          <Header />
          <main className="flex-1 min-h-0 p-3 sm:p-4 overflow-hidden">
            <ErrorBoundary>
              <Routes>
                <Route path="/sites" element={<Sites />} />
                <Route path="/surveys" element={<Surveys />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/violations" element={<Navigate to="/reports" replace />} />
                <Route path="/investigations" element={<Investigations />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="*" element={<Navigate to="/sites" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </USMSProvider>
    </Router>
  );
}

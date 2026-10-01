import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsPage } from './pages/AssetsPage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { TransfersPage } from './pages/TransfersPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BasesPage } from './pages/BasesPage';
import { ReportsPage } from './pages/ReportsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Card, CardTitle, CardDescription, CardContent } from './components/common/Card';
import { Badge } from './components/common/Badge';
import { ShieldCheck } from 'lucide-react';

const TacticalModule: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="space-y-6 animate-in fade-in duration-200">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <Badge variant="blue">SECURE CHANNEL</Badge>
    </div>

    <Card className="bg-white p-8 text-center border border-slate-200 shadow-sm rounded-2xl">
      <CardContent className="space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-2">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-lg text-slate-900">{title} Terminal</CardTitle>
        <CardDescription className="max-w-md mx-auto text-slate-500">
          Command interface for {title.toLowerCase()} is synchronized with Central Military Database. Operational logs and protocols are active.
        </CardDescription>
        <div className="pt-3">
          <Badge variant="operational" dot>
            COMMAND CLEARANCE ACTIVE
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/select-role" replace />} />
          <Route path="/select-role" element={<RoleSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Asset Management */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AssetsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AssetDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Purchase Management */}
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PurchasesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Transfer Management */}
          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TransfersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Assignments & Expenditures */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AssignmentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenditures"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AssignmentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Audit Logs */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <AuditLogsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Base Management (Admin) */}
          <Route
            path="/bases"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <BasesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Operational Sections */}
          <Route
            path="/requisitions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']}>
                <DashboardLayout>
                  <TacticalModule
                    title="Asset Requisitions"
                    description="Requisitions, approvals, and inter-base transfers management"
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                <DashboardLayout>
                  <TacticalModule
                    title="Maintenance Management"
                    description="Scheduled inspections, active maintenance, and overhaul workflows"
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/personnel"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                <DashboardLayout>
                  <TacticalModule
                    title="Personnel & Assignments"
                    description="Officer base assignments and asset custodian authorizations"
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <TacticalModule
                    title="System Settings"
                    description="Command configuration, security policies, and base profiles"
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

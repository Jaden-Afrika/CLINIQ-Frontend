import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import { isApprovedDoctor } from './api/auth'
import Layout from './components/Layout'
import PatientHome from './pages/patient/PatientHome'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorProfile from './pages/patient/DoctorProfile'
import Settings from './pages/Settings'
import MyTicket from './pages/patient/MyTicket'
import AdminHome from './pages/admin/AdminHome'
import SuperAdminHome from './pages/admin/SuperAdminHome'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminApprovalPending from './pages/auth/AdminApprovalPending'
import Notifications from './pages/patient/Notifications'
import DoctorLayout from './components/DoctorLayout'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorFreeSlots from './pages/doctor/DoctorFreeSlots'

function RoleAwareHome() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  if (user?.role === 'doctor') {
    if (isApprovedDoctor(user)) {
      return <Navigate to="/doctor" replace />
    }
    return <Navigate to="/admin-approval-pending" replace />
  }

  return <PatientDashboard />
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-approval-pending" element={<AdminApprovalPending />} />
          <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorLayout /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="free-slots" element={<DoctorFreeSlots />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <RoleAwareHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-ticket"
              element={
                <ProtectedRoute>
                  <MyTicket />
                </ProtectedRoute>
              }
            />
            <Route path="book" element={<ProtectedRoute requiredRole="patient"><PatientHome /></ProtectedRoute>} />
            <Route path="doctors/:doctorId" element={<ProtectedRoute requiredRole="patient"><DoctorProfile /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute requiredRole="patient"><Notifications /></ProtectedRoute>} />
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="staff">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="super-admin"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdminHome />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App

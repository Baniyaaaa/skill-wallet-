import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';
import AdminGuests from './pages/admin/AdminGuests';
import AdminPayments from './pages/admin/AdminPayments';

const staff = ['admin', 'staff'];

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<ProtectedRoute><BookRoom /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={staff}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute roles={['admin']}><AdminRooms /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute roles={staff}><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/guests" element={<ProtectedRoute roles={staff}><AdminGuests /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={staff}><AdminPayments /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

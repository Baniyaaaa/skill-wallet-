import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: optional array. Without it any logged-in user passes.
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

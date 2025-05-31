// components/auth/RoleGuard.jsx
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;

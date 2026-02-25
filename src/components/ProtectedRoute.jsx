import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

function ProtectedRoute({ children, redirectTo = '/' }) {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
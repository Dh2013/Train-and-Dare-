import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Spin } from 'antd';

/**
 * Protège l'accès à l'éditeur : redirige vers /administrateur si l'utilisateur n'est pas admin.
 * Aucune trace du contenu protégé pour les visiteurs non authentifiés.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading, checked } = useAuth();
  const location = useLocation();

  if (!checked || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/administrateur" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin)
    return (
      <div className="p-6 bg-white rounded shadow">
        Access denied. You are not an admin.
      </div>
    );

  return children;
}

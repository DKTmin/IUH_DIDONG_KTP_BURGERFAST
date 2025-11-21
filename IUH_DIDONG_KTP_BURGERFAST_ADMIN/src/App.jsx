import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">BurgerFast Admin</h1>
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link to="/products" className="text-slate-600 hover:text-slate-900">
            Products
          </Link>
          <Link to="/orders" className="text-slate-600 hover:text-slate-900">
            Orders
          </Link>
          {user ? (
            <div className="ml-4 flex items-center gap-3">
              <span className="text-sm text-slate-600">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm text-blue-600">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

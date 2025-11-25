import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import DeleteProduct from "./pages/DeleteProduct";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import UpdateProduct from "./pages/UpdateProduct";

function Header() {
  const { user, signOut } = useAuth();
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl  font-bold ">BurgerFast Admin</h1>
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <div className="relative inline-block">
            <button
              onClick={() => setProductsOpen((s) => !s)}
              className="cursor-pointer text-slate-600 hover:text-slate-900"
            >
              Products ▾
            </button>
            {productsOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
                <div className="p-2">
                  <Link
                    to="/products"
                    onClick={() => setProductsOpen(false)}
                    className="block px-3 py-2 hover:bg-slate-100"
                  >
                    Thêm sản phẩm theo phân loại
                  </Link>
                  <Link
                    to="/products/delete"
                    onClick={() => setProductsOpen(false)}
                    className="block px-3 py-2 hover:bg-slate-100"
                  >
                    Xóa sản phẩm theo phân loại
                  </Link>
                  <Link
                    to="/products/update"
                    onClick={() => setProductsOpen(false)}
                    className="block px-3 py-2 hover:bg-slate-100"
                  >
                    Cập nhật sản phẩm theo phân loại
                  </Link>
                </div>
              </div>
            )}
          </div>
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
              path="/products/delete"
              element={
                <ProtectedRoute>
                  <DeleteProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/update"
              element={
                <ProtectedRoute>
                  <UpdateProduct />
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

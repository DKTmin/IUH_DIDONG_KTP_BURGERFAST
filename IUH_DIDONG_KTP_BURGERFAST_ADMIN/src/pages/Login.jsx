import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-3">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center text-center mb-8 ">
          <div className="text-6xl mb-4 drop-shadow-lg">🍔</div>
          <h1 className="text-4xl font-bold bg-yellow-400 bg-clip-text text-transparent mb-2">
            BurgerFast
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2  p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Đăng nhập Admin
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@burgerfast.com"
                className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg focus:border-yellow-500 focus:outline-none transition duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg focus:border-yellow-500 focus:outline-none transition duration-300"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 transform ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Info Message */}
          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 text-center font-semibold">
              Chỉ những người dùng trong danh sách admins mới có thể truy cập
              trang quản lý này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";
import { authApi } from "../lib/api";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.post("/api/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError(
          "Cannot reach the server. Start the backend: cd backend → npm run dev"
        );
      } else if (err.response.status === 401) {
        setError(
          "Wrong email or password. Run: cd backend → node seedAdmin.js then use admin@palmsgrill.com / admin123"
        );
      } else if (err.response.status === 404) {
        setError(
          "Login API not found. Restart the backend (cd backend → npm run dev) so auth routes load."
        );
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #FF6B35, #F7931E)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
          The Palm&apos;s Grill Admin
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in to manage orders & menu</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@palmsgrill.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="admin123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-lg font-bold transition disabled:opacity-60"
            style={{ backgroundColor: loading ? "#ccc" : "#FF6B35" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Default: admin@palmsgrill.com / admin123
        </p>
      </div>
    </div>
  );
}

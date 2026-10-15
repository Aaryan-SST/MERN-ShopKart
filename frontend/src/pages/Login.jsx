import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCustomer, getMe } from "../services/api";

/**
 * Maps a server error response to a user-facing message.
 * 401 → "Invalid Credentials" (exact spec requirement)
 * 400 → server's message
 * network / 5xx → generic fallback
 */
function getServerError(err) {
  const status = err?.response?.status;
  if (status === 401) return "Invalid Credentials.";
  if (status === 400) return err.response.data?.message || "Invalid input.";
  return "Something went wrong. Please try again.";
}

/**
 * Client-side validation for login fields.
 * Returns per-field error strings.
 */
function validate({ email, password }) {
  const errors = { email: "", password: "" };
  if (!email.trim()) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Silently redirect already-logged-in users to /home.
  useEffect(() => {
    getMe()
      .then(() => navigate("/home", { replace: true }))
      .catch(() => {
        /* Not logged in — stay on this page */
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(form);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await loginCustomer({
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/home");
    } catch (err) {
      // Clear password field on failure — never log passwords.
      setForm((prev) => ({ ...prev, password: "" }));
      setServerError(getServerError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Heading */}
        <div className="mb-6 text-center">
          <span className="text-3xl">🛒</span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your ShopKart account.
          </p>
        </div>

        {/* Server-level error banner */}
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                fieldErrors.email
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                fieldErrors.password
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

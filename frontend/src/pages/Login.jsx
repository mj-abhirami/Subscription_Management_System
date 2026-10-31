
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, Zap } from "lucide-react";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { success, data } = response.data;

      if (!success || !data?.token) {
        throw new Error("Login failed. Please try again.");
      }

      localStorage.setItem("subsight_token", data.token);
      localStorage.setItem("subsight_user", JSON.stringify(data.user));

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-logo">
          <Zap size={25} />
        </div>
        <span>SUBSIGHT</span>
      </div>

      <div className="login-card">
        <div className="login-heading">
          <span>WELCOME BACK</span>
          <h1>Sign in to SUBSIGHT</h1>
          <p>Manage your subscriptions and understand your revenue.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email address</label>
            <div className="login-input">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <span>Forgot password?</span>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          Secure subscription management for your business.
        </div>
      </div>

      <p className="login-copyright">
        © 2026 SUBSIGHT. All rights reserved.
      </p>
    </div>
  );
}

export default Login;

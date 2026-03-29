import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Hexagon, AlertCircle } from "lucide-react";
import {
  AUTH_LOADING,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from "../../store/Constants/authConstants";
import { login as loginService } from "../../services/api";
import "./styles/LoginPage.scss";

const LoginPage = () => {
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  // inline field errors
  const [errors, setErrors] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // ── Validate single field ────────────────────────────────────
  const validateField = (name, value) => {
    if (name === "email") {
      if (!value)                             return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value))       return "Enter a valid email address";
      return "";
    }
    if (name === "password") {
      if (!value)                             return "Password is required";
      if (value.length < 6)                  return "Password must be at least 6 characters";
      return "";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email")    setEmail(value);
    if (name === "password") setPassword(value);
    // clear inline error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate all fields before submit
    const emailErr    = validateField("email",    email);
    const passwordErr = validateField("password", password);
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return; // ← stop here, no page refresh, no API call
    }

    dispatch({ type: AUTH_LOADING });

    try {
      const response = await loginService(email, password);
      if (response.success) {
        dispatch({ type: LOGIN_SUCCESS, payload: { user: response.user } });
        navigate("/");
      } else {
        dispatch({ type: LOGIN_FAILURE, payload: response.message || "Invalid credentials" });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Internal server error";
      dispatch({ type: LOGIN_FAILURE, payload: message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-full">

        {/* ── Left ── */}
        <div className="auth-left">
          <div className="auth-brand">
            <Hexagon size={28} color="#5a5fd6" strokeWidth={2} />
            <span>Hora ToolBox</span>
          </div>

          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p className="subtitle">Internal access only. Please sign in to continue.</p>
          </div>

          {/* API-level error banner */}
          {error && (
            <div className="error-banner">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className={`form-group ${errors.email ? "form-group--error" : ""}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@mittarv.com"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              {errors.email && (
                <span className="field-error">
                  <AlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className={`form-group ${errors.password ? "form-group--error" : ""}`}>
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">
                  <AlertCircle size={12} />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Options */}
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember for 30 days</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>
        </div>

        {/* ── Right ── */}
        <div className="auth-right">
          <div className="overlay" />
          <div className="quote-container">
            <div className="quote-mark">"</div>
            <p>Invest wisely today to build a secure, prosperous, and worry-free future for yourself and your loved ones.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
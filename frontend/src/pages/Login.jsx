import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", form);

    // Store everything needed
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    const user = res.data.user || { id: res.data.id, _id: res.data.id };
    user._id = user._id || user.id;
    sessionStorage.setItem("user", JSON.stringify(user));

    // Navigate by role
    if (res.data.role === "patient") {
      navigate("/patient");
    }
    else if (res.data.role === "doctor") {
      navigate("/doctor");
    }
    else if (res.data.role === "admin") {
      navigate("/hospital/AdminDashboard");
    }
     else {
      navigate("/dashboard");
    }
  } catch (err) {
    alert("Login failed. Please check your credentials.");
  }
};


  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="app-name">MedVault</h1>
        <h3 className="login-title">Welcome Back</h3>
        <p className="login-subtitle">Secure access to your health records</p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-input"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn-primary-modern" type="submit">
            Sign In
          </button>
        </form>
        <div className="footer-links">
          <a href="/forgot-password">Forgot password?</a>
          <div className="register-links">
            <a href="/register/patient">Create account as patient</a>
            <a href="/register/doctor">Create account as Clinic or Hospital</a>
          </div>
        </div>

      </div>
    </div>
  );
}

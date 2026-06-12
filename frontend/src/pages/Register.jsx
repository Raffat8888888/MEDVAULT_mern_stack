import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import './Register.css'; 

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // 🔘 toggle state (clinic by default)
  const [orgType, setOrgType] = useState("clinic");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalRole = orgType === "hospital" ? "admin" : role; // 👈 switch role only if hospital
    const response = await axios.post(`http://localhost:5000/api/auth/register/${finalRole}`, form);
    // Store user in sessionStorage if returned by backend
    if (response.data.user) {
      const user = response.data.user;
      user._id = user._id || user.id;
      sessionStorage.setItem("user", JSON.stringify(user));
    }
    alert(`${finalRole} registered`);
    navigate("/login");
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h1 className="app-name">MedVault</h1>
        <h2 className="register-title">
          {role.charAt(0).toUpperCase() + role.slice(1)} Registration
        </h2>
        <p className="register-subtitle">Create your secure healthcare account</p>

        {/* 🔘 Toggle buttons */}
        {role !== "patient" && (
        <div className="toggle-container">
          <button
            type="button"
            className={`toggle-btn ${orgType === "clinic" ? "active" : ""}`}
            onClick={() => setOrgType("clinic")}
          >
            Clinic
          </button>
          <button
            type="button"
            className={`toggle-btn ${orgType === "hospital" ? "active" : ""}`}
            onClick={() => setOrgType("hospital")}
          >
            Hospital
          </button>
        </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            className="form-control"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="form-control"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="form-control"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn-primary-modern" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

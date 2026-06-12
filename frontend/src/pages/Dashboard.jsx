import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <h1>MedVault</h1>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate("/login")}>Login</button>

          {/* Register Dropdown */}
          <div className="dropdown">
            <button
              className="dropbtn"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              Register ⌄
            </button>
            {openDropdown && (
              <div className="dropdown-content">
                <button onClick={() => navigate("/register/patient")}>
                  As Patient
                </button>
                <button onClick={() => navigate("/register/doctor")}>
                  As Clinic/Hospital
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay">
          <h2>Welcome to MedVault - Smart, and Simple Healthcare Management</h2>
          <p>Your health records, all in one place - accessible anytime, anywhere.</p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="cards">
        <div className="card">
          <img
            src="https://static.vecteezy.com/system/resources/previews/038/252/707/non_2x/hospital-building-illustration-medical-clinic-isolated-on-white-background-vector.jpg"
            alt="EHR"
          />
          <h3>80% of hospitals are moving towards EHR systems</h3>
          <p>Demographics helps doctors get to know you better.</p>
        </div>
        <div className="card">
          <img
            src="https://img.freepik.com/premium-vector/medical-clinic-logo_786241-344.jpg"
            alt="Doctor"
          />
          <h3>Instant access to your clinic records</h3>
          <p>Doctors can review your history anytime, anywhere.</p>
        </div>
        <div className="card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1430/1430504.png"
            alt="Patient"
          />
          <h3>Patient-Centered</h3>
          <p>Keep track of your allergies, surgeries, and chronic conditions.</p>
        </div>
      </section>

      {/* Health News */}
      <section className="news-panel">
        <div className="news-header">
          <h3>Health Industry News</h3>
          <button onClick={() => window.location.reload()}>↻ Refresh</button>
        </div>
        <iframe
          src="https://www.healthline.com/sponsored-topics"
          title="Health News"
          className="news-iframe"
        ></iframe>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="socials">
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
        <p>© 2025 MedVault</p>
      </footer>
    </div>
  );
}

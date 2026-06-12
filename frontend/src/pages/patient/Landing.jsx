// src/pages/patient/Landing.jsx
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./PatientPortal.css";

export default function PatientLanding() {
  const navigate = useNavigate();
  const infoRef = useRef(null);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

    useEffect(() => {
    const fetchNotifications = async () => {
      const userStr = sessionStorage.getItem("user");
      console.log("sessionStorage user:", userStr);
      if (!userStr) {
        console.warn("No user found in sessionStorage");
        return;
      }
      let user;
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user from sessionStorage:", e);
        return;
      }
      const userId = user._id || user.id;
      console.log("Using userId:", userId);
      if (!userId) {
        console.warn("User object missing _id and id:", user);
        return;
      }
  
      try {
        const res = await axios.get(
          `http://localhost:5000/api/patient/${userId}/notifications`
        );
        console.log("API response:", res.data);
        setNotifications(
          (res.data.notifications || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )
        );
        console.log("Set notifications:", res.data.notifications);
      } catch (err) {
        console.error(
          "Error fetching notifications:",
          err.response?.data || err.message
        );
      }
    };
  
    fetchNotifications();
  }, []);

const handleGiveAccess = async (note) => {
    try {
      // Get user from sessionStorage
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      await axios.post("http://localhost:5000/api/doctor/grant-access", {
        doctorId: note.doctorId, // must be present in notification
        patientId: user._id,     // get from sessionStorage
        section: note.section    // must be present in notification
      });
      setNotifications(notifications.filter(n => n._id !== note._id));
      alert("Access granted!");
    } catch (err) {
      alert("Failed to grant access.");
    }
  };

  const handleDeleteNotification = async (note) => {
    try {
      await axios.delete(`http://localhost:5000/api/patient/notification/${note._id}`);
      setNotifications(notifications.filter(n => n !== note));
    } catch (err) {
      alert("Failed to delete notification.");
    }
  };

  const handleKnowMore = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sections = [
    {
      label: "Demographics",
      path: "demographics",
      info: "Demographic information forms the foundation of personalized healthcare...",
      buttonText: "Save your Demographics"
    },
    {
      label: "Vitals",
      path: "vitals",
      info: "Vitals are essential indicators of your current health status...",
      buttonText: "Check and store your vitals"
    },
    {
      label: "Documents",
      path: "documents",
      info: "The Documents section allows you to securely store and manage all your important medical files...",
      buttonText: "Store Health related Documents"
    },
    {
      label: "Medical History",
      path: "medical-history",
      info: "The Medical History section provides a comprehensive view of your past health events...",
      buttonText: "Store Your Medical Past"
    },
    {
      label: "Your Information",
      path: "your-info",
      info: "See all the health data you've provided so far...",
      buttonText: "View & Manage Your Info"
    }
  ];

  return (
    <div className="patient-portal">
      {/* Header */}
      <header className="portal-header">
        <h1 className="logo">MedVault</h1>
        <div className="header-actions">
          <button
            className="dashboard-link"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
          <div className="notification-wrapper">
            <button
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                  {notifications.length > 0 ? (
                    notifications.map((note, idx) => (
                      <div key={idx} className="notification-item flex flex-col gap-2 border-b pb-2 mb-2">
                        <span>{note.message || note.text || note.content || JSON.stringify(note)}</span>
                        <div className="flex gap-2">
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleGiveAccess(note)}
                          >
                            Give Access
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleDeleteNotification(note)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="notification-item">No new notifications</p>
                  )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Welcome to MedVault</h2>
          <p>Your personal health companion. Smart, and Seamless.</p>
          <button className="know-more" onClick={handleKnowMore}>
            Know More
          </button>
        </div>
      </section>

      {/* Info Cards */}
      <section className="info-section">
        {sections.map((section, index) => (
          <div
            key={section.path}
            className={`info-card ${index % 2 === 0 ? "left" : "right"}`}
          >
            <div className="card-text">
              <h3>{section.label}</h3>
              <p>{section.info}</p>
            </div>
            <button
              className="inside-button"
              onClick={() => navigate(`/patient/${section.path}`)}
            >
              {section.buttonText}
            </button>
          </div>
        ))}
      </section>

      {/* Why We Collect Section */}
      <section className="why-we-collect" ref={infoRef}>
        <h2>Why We Collect Information in MedVault</h2>
        <p>
          At MedVault, we securely centralize your health data including demographic details for smarter healthcare.
        </p>
        <ul>
          <li>🧠 <strong>Smarter Health Insights:</strong> Personalized trends & awareness.</li>
          <li>🔒 <strong>Secure & Unified Storage:</strong> Everything in one encrypted platform.</li>
          <li>🤝 <strong>Effortless Sharing with Doctors:</strong> Instant, secure access.</li>
          <li>📊 <strong>Personalized Dashboards:</strong> Tailored health tips & alerts.</li>
          <li>🆘 <strong>Faster Emergency Help:</strong> Emergency contacts & location access.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="portal-footer">
        <p>&copy; 2025 MedVault. All rights reserved.</p>
      </footer>
    </div>
  );
}

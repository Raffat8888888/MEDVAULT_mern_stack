import { useState } from "react";
import AuditLogs from "./AuditLogs";
import AccessControl from "./AccessControl";
import LoginHistory from "./LoginHistory";
import Dashboard from "./Dashboard";
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");

  const renderSection = () => {
    switch (section) {
      case "access":
        return <AccessControl />;
      case "logs":
        return <AuditLogs />;
      case "logins":
        return <LoginHistory />;
      default:
        return <Dashboard/>;
    }
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <button onClick={() => setSection("dashboard")}>Dashboard</button>
        <button onClick={() => setSection("access")}>Access Control</button>
        <button onClick={() => setSection("logs")}>Audit Logs</button>
        <button onClick={() => setSection("logins")}>Login History</button>
      </div>
      <div className="main-content">{renderSection()}</div>
    </div>
  );
}

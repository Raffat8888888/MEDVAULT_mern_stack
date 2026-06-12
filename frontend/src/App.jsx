import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/patient/Landing.jsx";
import Demographics from "./pages/patient/Demographics.jsx";
import Vitals from "./pages/patient/Vitals.jsx";
import Documents from "./pages/patient/Documents.jsx";
import MedicalHistory from "./pages/patient/MedicalHistory.jsx";
import YourInformation from "./pages/patient/YourInformation.jsx";
import AdminDashboard from "./pages/hospital/AdminDashboard.jsx";
import Doctor from "./pages/hospital/DoctorLanding.jsx";
import DoctorPatientPage from "./pages/hospital/DoctorPatientPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";


export default function App() {
  const token = localStorage.getItem("token");
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/patient" element={<Landing/>}/>
      <Route path="/patient/demographics" element={<Demographics />} />
      <Route path="/patient/Vitals" element={<Vitals/>}/>
      <Route path="/patient/documents" element={<Documents/>}/>
      <Route path="/patient/medical-history" element={<MedicalHistory/>}/>
      <Route path="/patient/your-info" element={<YourInformation />} />
      <Route path="/hospital/AdminDashboard" element={<AdminDashboard/>}/>
      <Route path="/doctor" element={<Doctor/>}/>
      <Route path="/doctor/patient/:patientId" element={<DoctorPatientPage />} />
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      
    </Routes>
  );
}
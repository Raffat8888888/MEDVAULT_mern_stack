import { Routes, Route } from "react-router-dom";
import DoctorLanding from "./DoctorLanding";
import PatientProfile from "./PatientProfile";

export default function DoctorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLanding />} />
      <Route path="/patient/:patientId" element={<PatientProfile />} />
    </Routes>
  );
}

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorPortal.css";

export default function DoctorLanding() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: "", email: "" });

  const user = JSON.parse(sessionStorage.getItem("user"));
  const doctorId = user?.id || user?._id;

  useEffect(() => {
    if (!doctorId) return;
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctor/patients", { params: { doctorId } });
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchPatients();
  }, [doctorId]);

  const handleAddExistingPatient = async () => {
    if (!newPatient.email) return alert("Enter patient email");

    try {
      const res = await axios.post("http://localhost:5000/api/doctor/add-existing-patient", {
        doctorId,
        patientEmail: newPatient.email
      });
      setPatients(prev => [...prev, { ...res.data.patient }]);
      setNewPatient({ name: "", email: "" });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  const handleAddNewPatient = async () => {
    if (!newPatient.name || !newPatient.email) return alert("Enter name and email");

    try {
      const res = await axios.post("http://localhost:5000/api/doctor/add-new-patient", {
        doctorId,
        name: newPatient.name,
        email: newPatient.email
      });
      setPatients(prev => [...prev, { ...res.data.patient }]);
      setNewPatient({ name: "", email: "" });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="doctor-portal">
      <header className="portal-header"><h1>Doctor Portal - MedVault</h1></header>

      <section className="add-patient">
        <h2>Add Patient</h2>
        <input type="text" placeholder="Name (New Patient)" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
        <input type="email" placeholder="Patient Email" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} />
        <div className="button-group">
          <button onClick={handleAddExistingPatient}>Add Existing Patient</button>
          <button onClick={handleAddNewPatient}>Create & Add New Patient</button>
        </div>
      </section>

      <section className="patient-list">
        <h2>Patients</h2>
        {patients.length === 0 ? <p>No patients yet.</p> : (
          <ul>
            {patients.map(patient => (
              <li key={patient._id}>
                <button onClick={() => navigate(`/doctor/patient/${patient._id}`)}>
                  {patient.name || "Unknown"} ({patient.email})
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

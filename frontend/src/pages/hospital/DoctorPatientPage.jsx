import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorPortal.css";

export default function DoctorPatientPage() {
  const { patientId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || user?._id;

  const [patient, setPatient] = useState(null);
  const [requestedSections, setRequestedSections] = useState([]);

  const sections = ["Demographics", "Vitals", "Documents", "Medical History", "Prescriptions", "Lab Results", "Allergies"];

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patient/${patientId}`);
        setPatient(res.data.patient);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatient();
  }, [patientId]);

  const allowedSections = patient && doctorId
    ? Object.entries(patient.permissions?.[doctorId] || {})
        .filter(([section, allowed]) => allowed)
        .map(([section]) => section)
    : [];

  const handleRequestAccess = async () => {
    if (requestedSections.length === 0) return alert("Select sections to request");
    try {
      const res = await axios.post("http://localhost:5000/api/doctor/request-access", {
        doctorId,
        patientId,
        sections: requestedSections
      });
      alert(res.data.message);
      setRequestedSections([]);
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  if (!patient) return <p>Loading patient...</p>;

console.log("doctorId:", doctorId);
console.log("patient.permissions:", patient?.permissions);
console.log("allowedSections:", allowedSections);

  return (
    <div className="doctor-patient-page">
      <h2>{patient.name}'s Profile</h2>
      <p>Email: {patient.email}</p>

      <h3>Request Access to Sections:</h3>
      <div className="access-checkboxes">
        {sections.map(section => (
          <label key={section}>
            <input
              type="checkbox"
              value={section}
              checked={requestedSections.includes(section)}
              onChange={(e) => {
                const value = e.target.value;
                setRequestedSections(prev =>
                  prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
                );
              }}
            />
            {section}
          </label>
        ))}
        <ul>
        {allowedSections.map(section => (
          <li key={section}>
            <button onClick={() => navigate(`/doctor/patient/${patient._id}/${section.toLowerCase()}`)}>
              {section}
            </button>
          </li>
        ))}
      </ul>
      </div>

      <button onClick={handleRequestAccess}>Send Access Request</button>
    </div>
  );
}

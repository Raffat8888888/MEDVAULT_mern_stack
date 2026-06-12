import { useEffect, useState } from "react";
import axios from "axios";
import "./YourInformation.css";

export default function YourInformation() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const fetchUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!userId) {
        setError("User not found in localStorage");
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/user/${userId}`);
      setUserData(res.data);
    } catch (err) {
      setError("Failed to fetch user data.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleDelete = async (section, index = null) => {
    const confirmDelete = window.confirm("⚠️ Warning: Deleted data cannot be recovered. Are you sure?");
    if (!confirmDelete) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (section === "documents" && index !== null) {
        await axios.delete(`http://localhost:5000/api/user/delete/${userId}/documents/${index}`);
      } else {
        await axios.delete(`http://localhost:5000/api/user/delete/${userId}/${section}`);
      }

      fetchUserData();
    } catch {
      alert("Failed to delete.");
    }
  };

  const generateShareLink = (section) => {
    const url = `${window.location.origin}/share/${section}`;
    navigator.clipboard.writeText(url);
    alert("Shareable link copied to clipboard!");
  };

  return (
    <div className="your-info-container">
      <h2>Your Information</h2>
      {error && <p>{error}</p>}
      {!userData ? (
        <p>Loading...</p>
      ) : (
        <div className="info-sections">

          {/* Demographics */}
          {userData.demographics && Object.keys(userData.demographics).length > 0 && (
            <div className="info-card">
              <h3>Demographics</h3>
              <p><strong>Full Name:</strong> {userData.demographics.fullName}</p>
              <p><strong>Gender:</strong> {userData.demographics.gender}</p>
              <p><strong>Date of Birth:</strong> {userData.demographics.dateOfBirth}</p>
              <p><strong>Phone:</strong> {userData.demographics.phone}</p>
              <p><strong>Email:</strong> {userData.demographics.email}</p>
              <p><strong>Address:</strong> {userData.demographics.address}</p>
              <p><strong>City:</strong> {userData.demographics.city}</p>
              <p><strong>State:</strong> {userData.demographics.state}</p>
              <p><strong>ZIP Code:</strong> {userData.demographics.zipCode}</p>
              <p><strong>Country:</strong> {userData.demographics.country}</p>
              <p><strong>Marital Status:</strong> {userData.demographics.maritalStatus}</p>
              <p><strong>Blood Type:</strong> {userData.demographics.bloodType}</p>
              <p><strong>Has Insurance:</strong> {userData.demographics.hasInsurance}</p>
              <p><strong>Emergency Contact Name:</strong> {userData.demographics.emergencyContactName}</p>
              <p><strong>Emergency Contact Relation:</strong> {userData.demographics.emergencyContactRelation}</p>
              <p><strong>Emergency Contact Phone:</strong> {userData.demographics.emergencyContactPhone}</p>
              <button onClick={() => handleDelete("demographics")}>Delete</button>
            </div>
          )}

          {/* Vitals */}
          {userData.vitals && Object.keys(userData.vitals).length > 0 && (
            <div className="info-card">
              <h3>Vitals</h3>
              <p><strong>Height:</strong> {userData.vitals.height} cm</p>
              <p><strong>Weight:</strong> {userData.vitals.weight} kg</p>
              <p><strong>BMI:</strong> {userData.vitals.bmi}</p>
              <p><strong>Blood Pressure:</strong> {userData.vitals.bloodPressure}</p>
              <p><strong>Blood Sugar:</strong> {userData.vitals.bloodSugar} mg/dL</p>
              <button onClick={() => handleDelete("vitals")}>Delete</button>
              
            </div>
          )}

          {/* Medical History */}
          {userData.medicalHistory && Object.keys(userData.medicalHistory).length > 0 && (
            <div className="info-card">
              <h3>Medical History</h3>
              <p><strong>Allergies:</strong> {userData.medicalHistory.allergies}</p>
              <p><strong>Chronic Diseases:</strong> {userData.medicalHistory.chronicDiseases}</p>
              <p><strong>Family History:</strong> {userData.medicalHistory.familyHistory}</p>
              <p><strong>Surgeries:</strong> {userData.medicalHistory.surgeries}</p>
              <p><strong>Past Diagnoses:</strong> {userData.medicalHistory.pastDiagnoses}</p>
              <p><strong>Medications:</strong> {userData.medicalHistory.medications}</p>
              <p><strong>Lifestyle Habits:</strong> {userData.medicalHistory.lifestyleHabits}</p>
              <p><strong>Reproductive Health:</strong> {userData.medicalHistory.reproductiveHealth}</p>
              <button onClick={() => handleDelete("medicalHistory")}>Delete</button>
              
            </div>
          )}
          {/* Documents */}
          {userData.documents?.length > 0 &&
            userData.documents.map((doc, i) => (
              <div className="info-card" key={i}>
                <h3>Document {i + 1}</h3>
                <p><strong>Title:</strong> {doc.title}</p>
                <p><strong>Type:</strong> {doc.type}</p>
                <p><strong>Uploaded At:</strong> {new Date(doc.uploadedAt).toLocaleString()}</p>
                {doc.fileData && (
                  <a href={`data:application/octet-stream;base64,${doc.fileData}`} download={doc.title}>
                    Download File
                  </a>
                )}
                <button onClick={() => handleDelete("documents", i)}>Delete</button>
                
              </div>
            ))}
        </div>
      )}
      <p className="warning">⚠️ Warning: Deleted data cannot be recovered.</p>
    </div>
  );
}

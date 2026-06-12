import { useState } from "react";
import axios from "axios";
import "./MedicalHistory.css";

export default function MedicalHistory() {
  const [form, setForm] = useState({
    allergies: "",
    chronicDiseases: "",
    familyHistory: "",
    surgeries: "",             // matches schema
    pastDiagnoses: "",         // matches schema
    medications: "",           // matches schema
    lifestyleHabits: "",
    reproductiveHealth: "",    // matches schema
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/medical-history", {
        userId,
        ...form,
      });
      alert("Medical history saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save medical history.");
    }
  };

  return (
    <div className="mh-page">
      <div className="mh-container">
        <h2 className="mh-title">Medical History</h2>
        <form className="mh-form" onSubmit={handleSubmit}>
          {[
            { label: "Allergies", name: "allergies" },
            { label: "Chronic Diseases", name: "chronicDiseases" },
            { label: "Family Medical History", name: "familyHistory" },
            { label: "Surgeries/Procedures", name: "surgeries" }, 
            { label: "Past Diagnosed Conditions", name: "pastDiagnoses" }, 
            { label: "Current Medications", name: "medications" },
            { label: "Lifestyle Habits (e.g. smoking, exercise)", name: "lifestyleHabits" },
            { label: "Reproductive Diseases", name: "reproductiveHealth" },
          ].map((field) => (
            <label key={field.name}>
              {field.label}
              <textarea
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                required
              />
            </label>
          ))}
          <button className="mh-submit" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

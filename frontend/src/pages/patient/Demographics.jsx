import { useState } from "react";
import axios from "axios";
import "./Demographics.css";

export default function DemographicsForm() {
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    maritalStatus: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    bloodType: "",
    hasInsurance: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // In Demographics.jsx

const handleSubmit = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;

  if (!userId) {
    alert("User not authenticated. Please log in again.");
    return;
  }

  try {
    await axios.post(`http://localhost:5000/api/demographics/${userId}`, {
      ...form
    });
    alert("Demographics saved");
  } catch (err) {
    console.error(err);
    alert("Failed to save demographics");
  }
};


  return (
    <div className="page-background">
      <div className="form-container">
        <h2 className="form-title">Demographics Information</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="labeled-form">
          <label>Full Name:
            <input type="text" name="fullName" required placeholder="*Required*" value={form.fullName} onChange={handleChange} />
          </label>

          <label>Date of Birth:
            <input type="date" name="dateOfBirth" required placeholder="*Required*" value={form.dateOfBirth} onChange={handleChange} />
          </label>

          <label>Gender:
            <select name="gender" required value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </label>

          <label>Phone:
            <input type="tel" name="phone" pattern="[0-9]{10}" placeholder="*Required*" required value={form.phone} onChange={handleChange} />
          </label>

          <label>Email:
            <input type="email" name="email" required placeholder="*Required*" value={form.email} onChange={handleChange} />
          </label>

          <label>Address:
            <input type="text" name="address" required placeholder="*Required*" value={form.address} onChange={handleChange} />
          </label>

          <label>City:
            <input type="text" name="city" required placeholder="*Required*" value={form.city} onChange={handleChange} />
          </label>

          <label>State:
            <input type="text" name="state" required placeholder="*Required*" value={form.state} onChange={handleChange} />
          </label>

          <label>Zip Code:
            <input type="text" name="zipCode" pattern="\d{5,6}" placeholder="*Required*" required value={form.zipCode} onChange={handleChange} />
          </label>

          <label>Country:
            <input type="text" name="country" required placeholder="*Required*" value={form.country} onChange={handleChange} />
          </label>

          <label>Marital Status:
            <select name="maritalStatus" required value={form.maritalStatus} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>

          <label>Emergency Contact Name:
            <input type="text" name="emergencyContactName" required placeholder="*Required*" value={form.emergencyContactName} onChange={handleChange} />
          </label>

          <label>Emergency Contact Relation:
            <input type="text" name="emergencyContactRelation" required placeholder="*Required*" value={form.emergencyContactRelation} onChange={handleChange} />
          </label>

          <label>Emergency Contact Phone:
            <input type="tel" name="emergencyContactPhone" pattern="[0-9]{10}" placeholder="*Required*" required value={form.emergencyContactPhone} onChange={handleChange} />
          </label>

          <label>Blood Type:
            <select name="bloodType" required value={form.bloodType} onChange={handleChange}>
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A−">A−</option>
              <option value="B+">B+</option>
              <option value="B−">B−</option>
              <option value="AB+">AB+</option>
              <option value="AB−">AB−</option>
              <option value="O+">O+</option>
              <option value="O−">O−</option>
            </select>
          </label>

          <label>Do you have insurance?
            <select name="hasInsurance" required value={form.hasInsurance} onChange={handleChange}>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <button type="submit" className="btn-primary-modern">Submit</button>
        </form>
      </div>
    </div>
  );
}

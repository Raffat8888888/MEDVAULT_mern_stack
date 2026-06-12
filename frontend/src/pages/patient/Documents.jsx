// Full Documents.jsx with Base64 upload

import { useState } from "react";
import axios from "axios";
import "./Documents.css";

export default function Documents() {
  const [form, setForm] = useState({
    title: "",
    type: "",
    fileData: "", // base64 encoded
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        fileData: reader.result, // Base64 string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!form.title || !form.type || !form.fileData) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/documents", {
        ...form,
        userId,
      });
      alert("Document uploaded successfully!");
      setForm({ title: "", type: "", fileData: "" });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document");
    }
  };

  return (
    <div className="documents-container">
      <h2>Upload Medical Document</h2>
      <div className="form-group">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">Select</option>
          <option value="prescription">Prescription</option>
          <option value="visit-summary">Visit Summary</option>
          <option value="discharge-summary">Discharge Summary</option>
          <option value="vaccination-record">Vaccination Record</option>
          <option value="insurance-document">Insurance Document</option>
        </select>
      </div>
      <div className="form-group">
        <label>Upload File</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

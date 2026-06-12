import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [newProfessional, setNewProfessional] = useState({
    department: "",
    name: "",
    email: "",
    role: "doctor",
  });

  // Get userId from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;

  // Fetch Departments
  useEffect(() => {
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          params: { adminId: userId },
        });
        setDepartments(res.data.departments || []);
      } catch (err) {
        console.error(
          "Error fetching departments:",
          err.response?.data || err.message
        );
      }
    };
    fetchDepartments();
  }, [userId]);

  // Add Department
  const handleAddDepartment = async () => {
    if (!newDept) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/dashboard/add-department",
        {
          departmentName: newDept,
          adminId: userId,
        }
      );
      setDepartments(res.data.departments || []);
      setNewDept("");
    } catch (err) {
      console.error("Error adding department:", err);
    }
  };

  // Delete Department
  const handleDeleteDepartment = async (departmentName) => {
    if (!window.confirm(`Delete department "${departmentName}"?`)) return;
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/dashboard/delete-department",
        {
          data: { departmentName, adminId: userId },
        }
      );
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  // Add Professional (creates user automatically)
  const handleAddProfessional = async () => {
    if (
      !newProfessional.department ||
      !newProfessional.name ||
      !newProfessional.email
    )
      return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/dashboard/add-professional",
        {
          departmentName: newProfessional.department,
          name: newProfessional.name,
          email: newProfessional.email,
          role: newProfessional.role,
          adminId: userId,
        }
      );

      setDepartments((prev) =>
        prev.map((d) =>
          d.name === res.data.department.name ? res.data.department : d
        )
      );

      setNewProfessional({
        department: "",
        name: "",
        email: "",
        role: "doctor",
      });
    } catch (err) {
      console.error("Error adding professional:", err);
    }
  };

  // Edit Professional (name + email)
  const handleEditProfessional = async (departmentName, oldEmail, oldName) => {
    const newName = prompt("Enter new name:", oldName);
    if (newName === null) return;
    const newEmail = prompt("Enter new email:", oldEmail);
    if (newEmail === null) return;

    try {
      const res = await axios.put(
        "http://localhost:5000/api/dashboard/edit-professional",
        {
          departmentName,
          oldEmail,
          newName,
          newEmail,
          adminId: userId,
        }
      );

      setDepartments((prev) =>
        prev.map((d) =>
          d.name === res.data.department.name ? res.data.department : d
        )
      );
    } catch (err) {
      console.error("Error editing professional:", err);
    }
  };

  // Delete Professional
  const handleDeleteProfessional = async (departmentName, email) => {
    if (!window.confirm("Are you sure you want to delete this professional?"))
      return;
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/dashboard/delete-professional",
        {
          data: { departmentName, email, adminId: userId },
        }
      );

      setDepartments((prev) =>
        prev.map((d) =>
          d.name === res.data.department.name ? res.data.department : d
        )
      );
    } catch (err) {
      console.error("Error deleting professional:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Add Department */}
      <div className="mb-6">
        <input
          type="text"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
          placeholder="New Department Name"
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={handleAddDepartment}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!newDept}
        >
          Add Department
        </button>
      </div>

      {/* Add Professional */}
      <div className="mb-6">
        <select
          value={newProfessional.department}
          onChange={(e) =>
            setNewProfessional({ ...newProfessional, department: e.target.value })
          }
          className="border p-2 mr-2 rounded"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Name"
          value={newProfessional.name}
          onChange={(e) =>
            setNewProfessional({ ...newProfessional, name: e.target.value })
          }
          className="border p-2 mx-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={newProfessional.email}
          onChange={(e) =>
            setNewProfessional({ ...newProfessional, email: e.target.value })
          }
          className="border p-2 mx-2 rounded"
        />
        <select
          value={newProfessional.role}
          onChange={(e) =>
            setNewProfessional({ ...newProfessional, role: e.target.value })
          }
          className="border p-2 mx-2 rounded"
        >
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="technician">Technician</option>
        </select>
        <button
          onClick={handleAddProfessional}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={
            !newProfessional.department ||
            !newProfessional.name ||
            !newProfessional.email
          }
        >
          Add
        </button>
      </div>

      {/* Department Cards */}
      {departments.map((dept) => (
        <div key={dept.name} className="mb-6 p-4 border rounded shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">{dept.name}</h3>
            <button
              onClick={() => handleDeleteDepartment(dept.name)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete Dept
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {dept.professionals?.map((prof) => (
              <div key={prof.email} className="p-4 border rounded shadow">
                <h4 className="font-bold">{prof.name}</h4>
                <p>{prof.role}</p>
                <p>{prof.email}</p>
                <button
                  onClick={() =>
                    handleEditProfessional(dept.name, prof.email, prof.name)
                  }
                  className="bg-yellow-500 text-white px-3 py-1 mt-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleDeleteProfessional(dept.name, prof.email)
                  }
                  className="bg-red-500 text-white px-3 py-1 mt-2 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

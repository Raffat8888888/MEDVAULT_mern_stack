import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AccessControl() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch all departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/access/departments");
        const deptArray = Array.isArray(res.data) ? res.data : [];
        setDepartments(deptArray);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch permissions for a professional using email
  const fetchPermissions = async (professional) => {
    if (!professional?.email) {
      console.error("No professional email provided");
      return;
    }
    
    setLoading(true);
    try {
      // Use email-based endpoint instead of ID-based
      const res = await axios.get(`http://localhost:5000/api/access/permissions/email/${professional.email}`);
      setPermissions(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setPermissions({});
      setLoading(false);
    }
  };

  const handlePermissionToggle = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: { 
        ...prev[module], 
        [action]: !prev[module]?.[action] 
      },
    }));
  };

  const savePermissions = async () => {
    if (!selectedProfessional?.email) {
      console.error("No professional selected");
      return;
    }
    
    try {
      // Use email instead of userId for professionals without user documents
      await axios.post("http://localhost:5000/api/access/update-permissions", {
        email: selectedProfessional.email,
        permissions,
      });
      alert("Permissions updated successfully!");
    } catch (err) {
      console.error("Error saving permissions:", err);
      alert("Error saving permissions. Please check the console for details.");
    }
  };

  // Reset states when going back
  const goBackToDepartments = () => {
    setSelectedDept(null);
    setSelectedRole(null);
    setSelectedProfessional(null);
    setPermissions({});
  };

  const goBackToRoles = () => {
    setSelectedRole(null);
    setSelectedProfessional(null);
    setPermissions({});
  };

  const goBackToProfessionals = () => {
    setSelectedProfessional(null);
    setPermissions({});
  };

  if (!departments.length) return <p>Loading departments or no data available...</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Access Control</h2>

      {/* Department Cards */}
      {!selectedDept && (
        <div className="grid grid-cols-3 gap-4">
          {departments.map(dept => (
            <div
              key={dept._id || dept.name}
              className="p-4 bg-white shadow rounded-xl cursor-pointer hover:shadow-lg"
              onClick={() => setSelectedDept(dept)}
            >
              <h3 className="text-lg font-semibold">{dept.name}</h3>
              <p>{dept.professionals?.length || 0} professionals</p>
            </div>
          ))}
        </div>
      )}

      {/* Role Cards */}
      {selectedDept && !selectedRole && (
        <div>
          <button 
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onClick={goBackToDepartments}
          >
            ← Back to Departments
          </button>
          <h3 className="text-xl font-semibold mb-4">{selectedDept.name} - Choose Role</h3>
          <div className="grid grid-cols-3 gap-4">
            {["doctor", "nurse", "technician"].map(role => {
              const count = selectedDept.professionals?.filter(p => p.role === role).length || 0;
              return (
                <div
                  key={role}
                  className="p-4 bg-white shadow rounded-xl cursor-pointer hover:shadow-lg"
                  onClick={() => setSelectedRole(role)}
                >
                  <h4 className="capitalize font-semibold">{role}</h4>
                  <p>{count} members</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Professionals List */}
      {selectedRole && !selectedProfessional && (
        <div>
          <button 
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onClick={goBackToRoles}
          >
            ← Back to Roles
          </button>
          <h3 className="text-xl font-semibold mb-4">{selectedRole.toUpperCase()}s in {selectedDept.name}</h3>
          <div className="space-y-2">
            {selectedDept.professionals
              ?.filter(p => p.role === selectedRole)
              .map((pro, index) => (
                <div
                  key={pro._id || `${pro.email}-${index}`}
                  className="p-3 bg-white shadow rounded-xl cursor-pointer hover:shadow-lg"
                  onClick={() => {
                    console.log("Selected professional:", pro);
                    setSelectedProfessional(pro);
                    fetchPermissions(pro);
                  }}
                >
                  {pro.name} ({pro.email})
                </div>
              )) || []}
          </div>
        </div>
      )}

      {/* Permissions Table */}
      {selectedProfessional && (
        <div>
          <button 
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onClick={goBackToProfessionals}
          >
            ← Back to {selectedRole}s
          </button>
          <h3 className="text-xl font-semibold mb-4">Permissions for {selectedProfessional.name}</h3>

          {loading ? (
            <p>Loading permissions...</p>
          ) : Object.keys(permissions).length === 0 ? (
            <div>
              <p className="mb-4">No permissions set for this professional yet.</p>
              <button 
                onClick={() => {
                  // Initialize with default empty permissions
                  const defaultModules = [
                    "Demographics", "Vitals", "Medical History", "Documents", 
                    "Prescriptions", "Lab Results", "Allergies", "Audit Logs"
                  ];
                  const defaultPerms = {};
                  defaultModules.forEach(module => {
                    defaultPerms[module] = {
                      view: false,
                      edit: false,
                      delete: false,
                      export: false
                    };
                  });
                  setPermissions(defaultPerms);
                }}
                className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700"
              >
                Initialize Default Permissions
              </button>
            </div>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Module</th>
                  <th className="p-2 border">View</th>
                  <th className="p-2 border">Edit</th>
                  <th className="p-2 border">Delete</th>
                  <th className="p-2 border">Export</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([module, actions]) => (
                  <tr key={module}>
                    <td className="p-2 border font-semibold">{module}</td>
                    {["view", "edit", "delete", "export"].map(action => (
                      <td key={action} className="p-2 border text-center">
                        <input
                          type="checkbox"
                          checked={actions?.[action] || false}
                          onChange={() => handlePermissionToggle(module, action)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {Object.keys(permissions).length > 0 && (
            <button 
              onClick={savePermissions} 
              className="mt-4 px-6 py-2 bg-blue-600 text-black rounded hover:bg-blue-700"
            >
              Save Permissions
            </button>
          )}
        </div>
      )}
    </div>
  );
}

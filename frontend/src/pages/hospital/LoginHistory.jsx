import { useEffect, useState } from "react";

export default function LoginHistory() {
  const [history, setHistory] = useState([]);

  // Get adminId from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  // Prefer _id, fallback to id
  const adminId = user?._id || user?.id;

  useEffect(() => {
    if (!adminId) return;
    fetch(`http://localhost:5000/api/login-history/created-by/${adminId}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error(err));
  }, [adminId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Login History (Accounts Created by You)</h2>
      {history.length === 0 ? (
        <p>No login history found.</p>
      ) : (
        history.map((user) => (
          <div key={user._id} className="mb-6 border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{user.email}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {user.loginHistory.map((log, i) => (
                <li key={i}>
                  {new Date(log.timestamp).toLocaleString()} — Duration:{" "}
                  {log.duration ? `${log.duration} mins` : "N/A"}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  doc
} from "firebase/firestore";
import "../styles.css";

export default function AdminPanel() {
  const [roles, setRoles] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Viewer");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchRoles = async () => {
    const snapshot = await getDocs(collection(db, "roles"));
    const docs = snapshot.docs.map((doc) => ({
      email: doc.id,
      role: doc.data().role,
    }));
    setRoles(docs);
  };

  const assignRole = async () => {
    if (!newEmail) return alert("Enter email");
    await setDoc(doc(db, "roles", newEmail.toLowerCase()), { role: newRole });
    alert(`✅ ${newRole} role assigned to ${newEmail}`);
    setNewEmail("");
    fetchRoles();
  };

  const updateRole = async (email, updatedRole) => {
    await setDoc(doc(db, "roles", email), { role: updatedRole });
    alert(`🔁 Role updated for ${email}`);
    fetchRoles();
  };

  const downloadLogsCSV = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Logs"));
      const logs = snapshot.docs.map(doc => doc.data());

      if (logs.length === 0) {
        alert("⚠️ No logs found.");
        return;
      }

      const headers = ["timestamp", "email", "action", "details", "userAgent"];
      const csvRows = [
        headers.join(","),
        ...logs.map(log =>
          headers.map(h => `"${(log[h] || "").toString().replace(/"/g, '""')}"`).join(",")
        )
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Innoworq_Logs.csv");
      link.click();
    } catch (error) {
      console.error("❌ Error downloading logs:", error);
      alert("Failed to download logs. Check console for details.");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <aside className="sidebar">
        <h2>🛠️ Admin Panel</h2>
        <p className="role-badge">Role: Admin</p>
        <button onClick={downloadLogsCSV}>📋 Download Logs</button>
        <button onClick={() => window.location.href = "/dashboard"}>🏠 Back to Dashboard</button>
      </aside>

      <main className="main-content">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "« Hide Menu" : "☰ Show Menu"}
        </button>

        <h2>🔧 Manage Roles</h2>

        <div className="role-form">
          <input
            type="email"
            placeholder="User Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="Viewer">Viewer</option>
            <option value="Editor">Editor</option>
            <option value="Admin">Admin</option>
          </select>
          <button onClick={assignRole}>➕ Assign Role</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(({ email, role }) => (
              <tr key={email}>
                <td>{email}</td>
                <td>
                  <select
                    value={role}
                    onChange={(e) => updateRole(email, e.target.value)}
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

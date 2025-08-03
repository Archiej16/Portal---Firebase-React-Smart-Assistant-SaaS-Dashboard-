import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import {
  collection, getDocs, setDoc, doc, addDoc, deleteDoc, getDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styles.css";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [userRole, setUserRole] = useState("Viewer");
  const [loading, setLoading] = useState(true);
  const [newRow, setNewRow] = useState({ LABEL: "", "Site Type": "", CITY: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState("LABEL");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const visibleHeaders = ["LABEL", "Site Type", "CITY"];

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const roleSnap = await getDoc(doc(db, "roles", user.email.toLowerCase()));
        setUserRole(roleSnap.exists() ? roleSnap.data().role : "Viewer");
        fetchData();
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "SheetData"));
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRows(docs);
    } catch {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async (row) => {
    toast.promise((async () => {
      if (row.id) await setDoc(doc(db, "SheetData", row.id), row);
      else {
        const docRef = await addDoc(collection(db, "SheetData"), row);
        row.id = docRef.id;
      }
      fetchData();
    })(), {
      loading: "Saving...", success: "Saved!", error: "Save failed"
    });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this row?")) return;
    toast.promise(deleteDoc(doc(db, "SheetData", id)).then(fetchData), {
      loading: "Deleting...", success: "Deleted", error: "Delete failed"
    });
  };

  const logout = () => {
    signOut(auth).then(() => (window.location.href = "/"));
  };

  const exportDataToCSV = () => {
    const headers = visibleHeaders;
    const csvRows = [headers.join(","), ...rows.map(row =>
      headers.map(h => `"${row[h] || ""}"`).join(",")
    )];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Innoworq_Data.csv");
    link.click();
  };

  const filteredRows = rows.filter(row =>
    (row[filterColumn] || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <aside className="sidebar">
        <img src="/innoworq-logo.png" alt="Innoworq Logo" style={{ width: 140, marginBottom: 20 }} />
        <p className="role-badge">Role: {userRole}</p>
        {userRole === "Admin" && <>
          <button onClick={() => navigate("/admin")}>🛠️ Admin Panel</button>
          <button onClick={exportDataToCSV}>📤 Export CSV</button>
        </>}
        <button onClick={logout}>🚪 Logout</button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>

      <main className="main-content">
        <Toaster position="top-right" />
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "« Hide Menu" : "☰ Show Menu"}
        </button>

        <div className="table-controls">
          <select value={filterColumn} onChange={e => setFilterColumn(e.target.value)}>
            {visibleHeaders.map(h => <option key={h}>{h}</option>)}
          </select>
          <input placeholder={`Search ${filterColumn}`} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="table-controls">
          {visibleHeaders.map((key) => (
            <input key={key} placeholder={key}
              value={newRow[key]} onChange={e => setNewRow({ ...newRow, [key]: e.target.value })} />
          ))}
          {userRole !== "Viewer" && <button onClick={() => setRows([...rows, { ...newRow }])}>➕ Add</button>}
        </div>

        {loading ? <div className="loader">⏳ Loading...</div> : (
          <table>
            <thead>
              <tr>
                {visibleHeaders.map(h => <th key={h}>{h}</th>)}
                {userRole !== "Viewer" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={row.id || idx}>
                  {visibleHeaders.map(key => (
                    <td key={key} contentEditable={userRole !== "Viewer"}
                      suppressContentEditableWarning
                      onBlur={e => {
                        const updated = [...rows];
                        updated[idx][key] = e.target.textContent;
                        setRows(updated);
                      }}>
                      {row[key] || ""}
                    </td>
                  ))}
                  {userRole !== "Viewer" && (
                    <td>
                      <button onClick={() => saveChanges(row)}>💾</button>
                      <button onClick={() => deleteRow(row.id)}>❌</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

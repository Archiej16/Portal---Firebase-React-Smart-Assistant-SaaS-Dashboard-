import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children, requiredRole = "any" }) {
  const [status, setStatus] = useState("loading");
  const [userHasAccess, setUserHasAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("unauthenticated");
        return;
      }

      const roleDoc = await getDoc(doc(db, "roles", user.email));
      const userRole = roleDoc.exists() ? roleDoc.data().role : "Viewer";

      if (requiredRole === "any" || userRole === requiredRole || userRole === "Admin") {
        setUserHasAccess(true);
        setStatus("authenticated");
      } else {
        setStatus("unauthorized");
      }
    });

    return () => unsubscribe();
  }, [requiredRole]);

  if (status === "loading") return <p>🔄 Loading...</p>;
  if (status === "unauthenticated") return <Navigate to="/" />;
  if (!userHasAccess) return <p>🚫 Access denied.</p>;

  return children;
}
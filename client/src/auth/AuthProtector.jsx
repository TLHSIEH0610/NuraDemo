import { useAuth } from "./AuthContext.jsx";
import { Navigate } from "react-router";

export default function ({ children }) {
  const { isAuthed } = useAuth();

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

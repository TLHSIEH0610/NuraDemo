import { Navigate, Routes, Route } from "react-router";
import LoginPage from "./routes/HomePage";
import HomePage from "./routes/LoginPage";
import AuthProtector from "./auth/AuthProtector.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthProtector>
            <HomePage />
          </AuthProtector>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Assessment from "@/pages/Assessment";
import ReportView from "@/pages/ReportView";
import Admin from "@/pages/Admin";

const Guard = ({ role, children }) => {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Guard role="student"><Dashboard /></Guard>} />
            <Route path="/check-in" element={<Guard role="student"><Assessment /></Guard>} />
            <Route path="/report/:id" element={<Guard role="student"><ReportView /></Guard>} />
            <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" />
      </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;

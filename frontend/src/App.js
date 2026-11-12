import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import StudentHome from "@/pages/StudentHome";
import Assessment from "@/pages/Assessment";
import ReportView from "@/pages/ReportView";
import Admin from "@/pages/Admin";
import ProductDoc from "@/pages/ProductDoc";
import Counsellor from "@/pages/Counsellor";
import CounsellorStudent from "@/pages/CounsellorStudent";

export const homeFor = (role) => (role === "admin" ? "/admin" : role === "counsellor" ? "/counsellor" : "/dashboard");

const Guard = ({ role, children }) => {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && ![].concat(role).includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
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
            <Route path="/dashboard" element={<Guard role="student"><StudentHome /></Guard>} />
            <Route path="/check-in" element={<Guard role="student"><Assessment /></Guard>} />
            <Route path="/report/:id" element={<Guard role={["student", "counsellor"]}><ReportView /></Guard>} />
            <Route path="/counsellor" element={<Guard role="counsellor"><Counsellor /></Guard>} />
            <Route path="/counsellor/student/:uid" element={<Guard role="counsellor"><CounsellorStudent /></Guard>} />
            <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
            <Route path="/admin/product-doc" element={<Guard role="admin"><ProductDoc /></Guard>} />
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

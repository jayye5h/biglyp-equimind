import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "@/lib/theme";
import BiglypHome from "@/pages/BiglypHome";
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
  const { B, setBrand } = useTheme();
  // Signed-in pages always wear the user's own programme brand (admins: EquiMind), whatever product was browsed last
  const own = user ? (user.role === "admin" ? "equimind" : user.programme || "equimind") : null;
  useEffect(() => { if (own && B.key !== own) setBrand(own); }, [own, B.key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return null;
  if (!user) return <Navigate to={B.login} replace />;
  if (role && ![].concat(role).includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  if (B.key !== own) return null;
  return children;
};

function App() {
  return (
    <div className="App">
      <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BiglypHome />} />
            <Route path="/equimind" element={<Landing brand="equimind" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mindmellow" element={<Landing brand="mindmellow" />} />
            <Route path="/mindmellow/login" element={<Login brand="mindmellow" />} />
            <Route path="/mindedge" element={<Landing brand="mindedge" />} />
            <Route path="/mindedge/login" element={<Login brand="mindedge" />} />
            <Route path="/focusedge" element={<Landing brand="focusedge" />} />
            <Route path="/focusedge/login" element={<Login brand="focusedge" />} />
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

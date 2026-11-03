import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Logo = ({ to = "/", small }) => (
  <Link to={to} data-testid="brand-logo-link" className="flex items-center gap-2.5 group">
    <span className={`${small ? "h-9 w-9" : "h-11 w-11"} rounded-2xl bg-[#2d8a7c] grid place-items-center shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg]`}>
      <Heart className="h-5 w-5 text-white" strokeWidth={2.2} />
    </span>
    <span className="leading-none">
      <span className={`font-serif ${small ? "text-xl" : "text-2xl"} font-semibold text-[#2d8a7c]`}>EquiMind</span>
      <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1">by Biglyp</span>
    </span>
  </Link>
);

export const AppHeader = ({ children }) => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const out = async () => {
    await logout();
    nav("/");
  };
  return (
    <header className="sticky top-0 z-30 bg-[#f0fbf9]/80 backdrop-blur-xl border-b border-[#2d8a7c]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Logo small to={user?.role === "admin" ? "/admin" : "/dashboard"} />
        <div className="flex items-center gap-3">
          {children}
          <span data-testid="header-user-name" className="hidden sm:block text-sm text-slate-600">{user?.name}</span>
          <button data-testid="logout-button" onClick={out} className="h-9 px-3 rounded-full border border-[#2d8a7c]/20 text-sm text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const SafetyStrip = ({ testid = "safety-strip" }) => (
  <div data-testid={testid} className="rounded-2xl border border-[#f07167]/30 bg-[#fff0ee] px-5 py-4 text-sm text-slate-800">
    <span className="font-semibold text-[#c2410c]">If you feel unsafe right now:</span> call Tele-MANAS{" "}
    <a href="tel:14416" className="font-mono font-semibold underline decoration-[#f07167]/50">14416</a> or{" "}
    <a href="tel:18008914416" className="font-mono font-semibold underline decoration-[#f07167]/50">1800-891-4416</a> (24/7, free, confidential), or{" "}
    <a href="tel:112" className="font-mono font-semibold underline decoration-[#f07167]/50">112</a> in an emergency.
  </div>
);

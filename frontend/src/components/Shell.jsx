import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart, LogOut, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme, PALETTES } from "@/lib/theme";
import { NotificationBell } from "@/components/NotificationBell";
import { ContactDialog } from "@/components/ContactDialog";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div data-testid="theme-toggle" role="radiogroup" aria-label="Colour theme" className="flex items-center gap-1 rounded-full bg-white/80 border border-slate-200 p-1">
      {Object.entries(PALETTES).map(([k, p]) => (
        <button key={k} data-testid={`theme-toggle-${k}`} role="radio" aria-checked={theme === k} title={p.label} onClick={() => setTheme(k)}
          className={`h-7 w-7 rounded-full grid place-items-center transition-shadow ${theme === k ? "ring-2 ring-slate-800" : "hover:ring-2 hover:ring-slate-300"}`}>
          <span className="h-4 w-4 rounded-full" style={{ background: p.p }} />
        </button>
      ))}
    </div>
  );
};

export const Logo = ({ to = "/", small }) => (
  <Link to={to} data-testid="brand-logo-link" className="flex items-center gap-2.5 group">
    <span className={`${small ? "h-9 w-9" : "h-11 w-11"} rounded-2xl bg-eq grid place-items-center shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg]`}>
      <Heart className="h-5 w-5 text-white" strokeWidth={2.2} />
    </span>
    <span className="leading-none">
      <span className={`font-serif ${small ? "text-xl" : "text-2xl"} font-semibold text-eq`}>EquiMind</span>
      <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1">by Biglyp</span>
    </span>
  </Link>
);

export const AppHeader = ({ children }) => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [contact, setContact] = useState(false);
  const out = async () => {
    await logout();
    nav("/");
  };
  return (
    <header className="sticky top-0 z-30 bg-eq-bg/80 backdrop-blur-xl border-b border-eq/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Logo small to={user?.role === "admin" ? "/admin" : user?.role === "counsellor" ? "/counsellor" : "/dashboard"} />
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="hidden sm:block"><ThemeToggle /></div>
          {children}
          {user && <NotificationBell />}
          {user && (
            <button data-testid="contact-details-btn" onClick={() => setContact(true)} title="Contact details" aria-label="Contact details" className="h-9 w-9 rounded-full hover:bg-white grid place-items-center text-slate-700">
              <UserCog className="h-5 w-5" />
            </button>
          )}
          <span data-testid="header-user-name" className="hidden sm:block text-sm text-slate-600">{user?.name}</span>
          <button data-testid="logout-button" onClick={out} className="h-9 px-3 rounded-full border border-eq/20 text-sm text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
      <ContactDialog open={contact} onOpenChange={setContact} />
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

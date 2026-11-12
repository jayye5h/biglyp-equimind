import { Link } from "react-router-dom";
import { useState } from "react";
import { Home, ClipboardCheck, BarChart3, PieChart, LayoutGrid, Headset, LogOut, UserCog } from "lucide-react";
import { Logo, ThemeToggle } from "@/components/Shell";
import { NotificationBell } from "@/components/NotificationBell";
import { ContactDialog } from "@/components/ContactDialog";
import { useAuth } from "@/lib/auth";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "checkin", label: "Daily Check-in", icon: ClipboardCheck },
  { id: "journey", label: "My Journey", icon: BarChart3 },
  { id: "insights", label: "Insights", icon: PieChart },
  { id: "toolkit", label: "Toolkit", icon: LayoutGrid },
  { id: "support", label: "Support", icon: Headset },
];

const NavButton = ({ n, active, onNav, compact }) => (
  <button data-testid={`${compact ? "mnav" : "nav"}-${n.id}`} onClick={() => onNav(n.id)}
    className={`flex items-center gap-3 rounded-2xl transition-colors ${compact ? "shrink-0 h-10 px-4 text-sm" : "w-full h-12 px-4"} ${active ? "bg-eq-soft text-eq-dark font-semibold" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}>
    <n.icon className="h-5 w-5" />{n.label}
  </button>
);

export const HomeLayout = ({ tab, onNav, pending, onBell, children }) => {
  const { user, logout } = useAuth();
  const [contact, setContact] = useState(false);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-eq-bg/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Logo small to="/dashboard" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <NotificationBell pending={pending} onPending={onBell} />
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="profile-menu-btn" className="h-10 w-10 rounded-full bg-eq text-white font-semibold grid place-items-center">{user.name[0]}</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel><div>{user.name}</div><div className="text-xs font-normal text-slate-500">{user.program} · {user.year}</div></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="contact-details-btn" onClick={() => setContact(true)} className="gap-2"><UserCog className="h-4 w-4" /> Contact details</DropdownMenuItem>
                <DropdownMenuItem data-testid="logout-button" onClick={logout} className="gap-2"><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav className="lg:hidden flex gap-1 overflow-x-auto px-4 pb-3">{NAV.map((n) => <NavButton key={n.id} n={n} active={tab === n.id} onNav={onNav} compact />)}</nav>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 grid lg:grid-cols-[210px_1fr] gap-8">
        <aside className="hidden lg:block"><nav className="sticky top-24 space-y-1">{NAV.map((n) => <NavButton key={n.id} n={n} active={tab === n.id} onNav={onNav} />)}</nav></aside>
        <main className="min-w-0 space-y-7 pt-2">{children}</main>
      </div>
      <ContactDialog open={contact} onOpenChange={setContact} />
    </div>
  );
};

export const NoReportCard = () => (
  <section data-testid="journey-empty" className="rounded-[2rem] bg-white border border-dashed border-eq/30 p-8 sm:p-10">
    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Your 14-Day Wellness Journey starts here</h2>
    <p className="mt-2 text-slate-600 max-w-xl">Take your first 6-minute check-in. You&apos;ll get your report and a 14-day plan, and this card will track your progress day by day.</p>
    <Link to="/check-in" data-testid="journey-start-checkin-btn" className="mt-6 inline-flex h-12 px-6 rounded-2xl bg-eq text-white font-medium items-center hover:bg-eq-dark transition-colors">Start your first check-in</Link>
  </section>
);

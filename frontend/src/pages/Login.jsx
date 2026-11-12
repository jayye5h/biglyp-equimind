import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo, ThemeToggle, ProductTabs } from "@/components/Shell";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export default function Login({ brand = "equimind" }) {
  const [users, setUsers] = useState([]);
  const { setBrand, B } = useTheme();
  useEffect(() => { setBrand(brand); }, [brand]); // eslint-disable-line react-hooks/exhaustive-deps
  const [busy, setBusy] = useState(null);
  const { login, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    // each programme login lists its own students + counsellor; the shared platform admin appears on all
    api.get("/auth/demo-users").then((r) => setUsers(r.data.filter((u) => u.role === "admin" || (u.programme || "equimind") === brand)));
  }, [brand]);

  useEffect(() => {
    if (user) nav(user.role === "admin" ? "/admin" : user.role === "counsellor" ? "/counsellor" : "/dashboard", { replace: true });
  }, [user, nav]);

  const pick = async (id) => {
    setBusy(id);
    try {
      await login(id);
    } catch (e) {
      toast.error(errMsg(e));
      setBusy(null);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-screen eq-grain">
      <ProductTabs target="login" />
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between gap-4"><Logo /><ThemeToggle /></div>
        <div className="mt-16 eq-rise">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900">Welcome <em className="text-eq">back.</em></h1>
          <p className="mt-4 text-slate-600">Choose a demo account to continue{B.school ? ` — ${B.name} for ${B.audience}` : ""}.</p>
          <p data-testid="mock-login-notice" className="mt-3 inline-block rounded-full bg-[#fef3c7] px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-[#92400e]">Demo login — mocked, no password needed</p>
        </div>
        <div className="mt-10 grid gap-4">
          {users.map((u, i) => (
            <button key={u.id} data-testid={`demo-login-${u.id}`} onClick={() => pick(u.id)} disabled={!!busy}
              className={`eq-rise eq-d${i + 1} text-left rounded-2xl bg-white border border-eq/10 p-5 sm:p-6 flex items-center gap-5 hover:border-eq/40 hover:shadow-md transition-[border-color,box-shadow] duration-200 disabled:opacity-60`}>
              <span className={`h-12 w-12 rounded-2xl grid place-items-center ${u.role === "admin" ? "bg-[#1b1e3d]" : "bg-eq-soft"}`}>
                {u.role === "admin" ? <ShieldCheck className="h-5 w-5 text-[#fbbf24]" /> : <GraduationCap className="h-5 w-5 text-eq" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-800">{u.name}</span>
                <span className="block text-sm text-slate-500">{u.role === "admin" ? "Platform admin · question bank & activities" : u.role === "counsellor" ? `${u.program} · sessions & student support` : [u.program, u.year, u.level].filter(Boolean).join(" · ")}</span>
              </span>
              {busy === u.id ? <Loader2 className="h-5 w-5 animate-spin text-eq" /> : <ArrowRight className="h-5 w-5 text-slate-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/Shell";
import { ReportPages, reportSections } from "@/components/report/ReportPages";
import { exportPdf } from "@/components/report/exportPdf";
import { api, errMsg } from "@/lib/api";

export default function ReportView() {
  const { id } = useParams();
  const { hash } = useLocation();
  const [r, setR] = useState(null);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then((res) => setR(res.data)).catch((e) => toast.error(errMsg(e)));
  }, [id]);

  useEffect(() => {
    if (r && hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 200);
  }, [r, hash]);

  const onSave = useCallback((patch) => {
    setR((prev) => ({ ...prev, ...patch }));
    api.patch(`/reports/${id}/progress`, patch).catch((e) => toast.error(errMsg(e)));
  }, [id]);

  useEffect(() => {
    if (!exporting) return;
    const t = setTimeout(async () => {
      try {
        await exportPdf(printRef.current, `EquiMind-Report-${r.student.name.replace(/\s+/g, "-")}.pdf`);
        toast.success("Report downloaded");
      } catch (e) {
        toast.error("Could not create the PDF. Please try again.");
      } finally {
        setExporting(false);
      }
    }, 400);
    return () => { clearTimeout(t); };
  }, [exporting, r]);

  const download = (
    <button data-testid="download-pdf-report-btn" onClick={() => setExporting(true)} disabled={!r || exporting}
      className="h-9 px-4 rounded-full bg-[#2d8a7c] text-white text-sm inline-flex items-center gap-1.5 hover:bg-[#226b60] transition-colors disabled:opacity-60">
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} <span className="hidden sm:inline">{exporting ? "Preparing PDF…" : "Download PDF"}</span>
    </button>
  );

  return (
    <div data-testid="report-view-page" className="min-h-screen">
      <AppHeader>{download}</AppHeader>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <Link to="/dashboard" data-testid="back-to-dashboard-link" className="mb-4 text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            {r && reportSections(r).map((s, i) => (
              <a key={s.id} href={`#${s.id}`} data-testid={`report-nav-${s.id}`} className="block text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg px-3 py-1.5 transition-colors"><span className="font-mono text-[10px] text-slate-400 mr-2">{String(i + 1).padStart(2, "0")}</span>{s.label}</a>
            ))}
          </div>
        </aside>
        <div className="min-w-0">
          <Link to="/dashboard" className="lg:hidden mb-4 text-sm text-slate-500 inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          {r ? <ReportPages r={r} onSave={onSave} /> : <div className="h-96 rounded-[2rem] bg-white/60 animate-pulse" />}
        </div>
      </main>
      {exporting && r && (
        <div ref={printRef} aria-hidden className="fixed top-0 -left-[12000px] w-[900px] p-4 bg-[#f0fbf9]">
          <ReportPages r={r} onSave={() => {}} print />
        </div>
      )}
    </div>
  );
}

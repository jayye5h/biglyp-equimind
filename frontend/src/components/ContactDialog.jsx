import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/** Lets any signed-in user set the email and phone used for email / SMS notifications. */
export const ContactDialog = ({ open, onOpenChange }) => {
  const [f, setF] = useState({ email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) api.get("/me/contact").then((r) => setF(r.data)).catch(() => {});
  }, [open]);
  const save = async () => {
    setBusy(true);
    try {
      const r = await api.put("/me/contact", f);
      setF(r.data);
      toast.success("Contact details saved");
      onOpenChange(false);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Couldn't save — please try again");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="contact-dialog" className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-6">
        <DialogTitle className="font-serif text-2xl">Contact details</DialogTitle>
        <DialogDescription className="text-sm text-slate-500">Used for email and SMS notifications, such as session bookings and reminders. Leave a field empty to skip that channel.</DialogDescription>
        <label className="mt-2 block text-sm font-medium text-slate-700">Email
          <span className="mt-1 flex items-center gap-2 rounded-xl border border-eq/20 px-3 focus-within:border-eq">
            <Mail className="h-4 w-4 text-slate-400" />
            <input data-testid="contact-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@university.edu" className="h-11 flex-1 bg-transparent outline-none text-sm" />
          </span>
        </label>
        <label className="block text-sm font-medium text-slate-700">Mobile number
          <span className="mt-1 flex items-center gap-2 rounded-xl border border-eq/20 px-3 focus-within:border-eq">
            <Phone className="h-4 w-4 text-slate-400" />
            <input data-testid="contact-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 98450 12345" className="h-11 flex-1 bg-transparent outline-none text-sm" />
          </span>
        </label>
        <button data-testid="contact-save" onClick={save} disabled={busy} className="mt-2 h-11 rounded-full bg-eq text-white font-semibold hover:bg-eq-dark disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
      </DialogContent>
    </Dialog>
  );
};

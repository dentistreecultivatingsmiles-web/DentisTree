import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/adminApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "./ImageField";
import { Loader2 } from "lucide-react";

export const ClinicTab = () => {
  const [clinic, setClinic] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/content").then((res) => setClinic(res.data.clinic));
  }, []);

  if (!clinic) return <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mt-10" />;

  const set = (k) => (e) => setClinic({ ...clinic, [k]: e.target.value });
  const setHour = (i, v) => {
    const hours = clinic.hours.map((h, idx) => (idx === i ? { ...h, time: v } : h));
    setClinic({ ...clinic, hours });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/clinic", clinic);
      toast.success("Clinic info saved — live on the site now");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    }
    setSaving(false);
  };

  const fields = [
    ["name", "Clinic Name"], ["tagline", "Tagline"], ["address", "Address"], ["landmark", "Landmark"],
    ["phone", "Phone (with +91, for call links)"], ["phone_display", "Phone (display text)"],
    ["whatsapp", "WhatsApp number (digits only, with country code)"], ["email", "Email"],
    ["map_embed", "Google Map embed URL"], ["map_link", "Google Maps link (directions)"],
  ];

  return (
    <div className="space-y-5 max-w-2xl" data-testid="clinic-tab">
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Logo</Label>
        <ImageField value={clinic.logo} onChange={(v) => setClinic({ ...clinic, logo: v })} testId="clinic-logo" />
      </div>
      {fields.map(([k, label]) => (
        <div key={k} className="space-y-1.5">
          <Label className="text-zinc-300">{label}</Label>
          <Input data-testid={`clinic-${k}-input`} value={clinic[k] || ""} onChange={set(k)} className="bg-[#121212] border-zinc-800 text-white h-11" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Google rating</Label>
          <Input data-testid="clinic-rating-input" type="number" step="0.1" value={clinic.rating} onChange={(e) => setClinic({ ...clinic, rating: parseFloat(e.target.value) || 0 })} className="bg-[#121212] border-zinc-800 text-white h-11" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Review count</Label>
          <Input data-testid="clinic-review-count-input" type="number" value={clinic.review_count} onChange={(e) => setClinic({ ...clinic, review_count: parseInt(e.target.value) || 0 })} className="bg-[#121212] border-zinc-800 text-white h-11" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-zinc-300">Operating hours</Label>
        {clinic.hours.map((h, i) => (
          <div key={h.day} className="flex items-center gap-3">
            <span className="w-28 text-sm text-zinc-400">{h.day}</span>
            <Input data-testid={`clinic-hours-${i}-input`} value={h.time} onChange={(e) => setHour(i, e.target.value)} className="bg-[#121212] border-zinc-800 text-white h-10 text-sm" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Hero intro text (shown under the clinic name)</Label>
        <Textarea data-testid="clinic-hero-text-input" value={clinic.hero_text || ""} onChange={set("hero_text")} placeholder="Leave empty to use the default text" className="bg-[#121212] border-zinc-800 text-white" />
      </div>
      <button data-testid="clinic-save-btn" onClick={save} disabled={saving} className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 transition-colors disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
};

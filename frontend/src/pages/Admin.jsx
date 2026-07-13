import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/adminApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClinicTab } from "@/components/admin/ClinicTab";
import { EntityTab } from "@/components/admin/EntityTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { LogOut, Loader2, Lock } from "lucide-react";

const FIELDS = {
  services: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "icon", label: "Icon (Sparkles, Sun, Activity, AlignCenterVertical, Anchor, Smile, Baby, ShieldPlus)" },
    { key: "order", label: "Order", type: "number" },
  ],
  doctors: [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "qualification", label: "Qualification" },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "photo", label: "Photo", type: "image" },
    { key: "order", label: "Order", type: "number" },
  ],
  reviews: [
    { key: "author", label: "Reviewer name" },
    { key: "rating", label: "Star rating (1-5)", type: "number" },
    { key: "time_ago", label: "Time (e.g. 2 weeks ago)" },
    { key: "text", label: "Review text", type: "textarea" },
    { key: "order", label: "Order", type: "number" },
  ],
  gallery: [
    { key: "url", label: "Photo", type: "image" },
    { key: "caption", label: "Caption" },
    { key: "order", label: "Order", type: "number" },
  ],
};

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", form);
      onLogin(data);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Login failed");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
      <form onSubmit={submit} data-testid="admin-login-form" className="w-full max-w-sm rounded-2xl bg-[#0A0A0A] border border-zinc-800 p-8 space-y-5">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-zinc-500 mt-1">DentisTree content manager</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Email</Label>
          <Input data-testid="admin-email-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-[#121212] border-zinc-800 text-white h-11" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Password</Label>
          <Input data-testid="admin-password-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-[#121212] border-zinc-800 text-white h-11" />
        </div>
        <button data-testid="admin-login-btn" type="submit" disabled={busy} className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 transition-colors disabled:opacity-50">
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default function Admin() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then((res) => setUser(res.data)).catch(() => setUser(false));
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(false);
  };

  if (user === null)
    return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>;
  if (user === false) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-heading font-bold">DentisTree <span className="text-emerald-400">Admin</span></span>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors" data-testid="admin-view-site-link">View site →</a>
            <button data-testid="admin-logout-btn" onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-rose-400 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="clinic">
          <TabsList className="bg-[#0A0A0A] border border-zinc-800 flex-wrap h-auto">
            {["clinic", "services", "doctors", "reviews", "gallery", "bookings"].map((t) => (
              <TabsTrigger key={t} value={t} data-testid={`admin-tab-${t}`} className="capitalize data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                {t === "clinic" ? "Clinic Info" : t}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-6">
            <TabsContent value="clinic"><ClinicTab /></TabsContent>
            <TabsContent value="services"><EntityTab collection="services" fields={FIELDS.services} titleKey="title" label="Service" /></TabsContent>
            <TabsContent value="doctors"><EntityTab collection="doctors" fields={FIELDS.doctors} titleKey="name" label="Doctor" /></TabsContent>
            <TabsContent value="reviews"><EntityTab collection="reviews" fields={FIELDS.reviews} titleKey="author" label="Review" /></TabsContent>
            <TabsContent value="gallery"><EntityTab collection="gallery" fields={FIELDS.gallery} titleKey="caption" label="Photo" /></TabsContent>
            <TabsContent value="bookings"><BookingsTab /></TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

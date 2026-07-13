import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingModal({ open, onOpenChange, clinic }) {
  const [form, setForm] = useState({ full_name: "", phone: "", dob: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim() || !form.dob) {
      toast.error("Please fill in all three fields.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/bookings`, form);
    } catch (err) {
      toast.warning("Couldn't save your details on our side, but WhatsApp will still open.");
    }
    const dobFormatted = new Date(form.dob).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
    const message = `Hi DentisTree! I'd like to book an appointment.%0A%0A*Name:* ${encodeURIComponent(
      form.full_name
    )}%0A*Phone:* ${encodeURIComponent(form.phone)}%0A*Date of Birth:* ${encodeURIComponent(
      dobFormatted
    )}%0A%0APlease confirm my slot. Thank you!`;
    window.open(`https://wa.me/${clinic.whatsapp}?text=${message}`, "_blank");
    setSubmitting(false);
    onOpenChange(false);
    setForm({ full_name: "", phone: "", dob: "" });
    toast.success("Opening WhatsApp — just hit send!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="booking-modal"
        className="bg-[#0A0A0A] border-zinc-800 text-white sm:max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold tracking-tight text-left">
            Book your appointment
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-left">
            Fill in your details — we'll open WhatsApp with a pre-filled message to the clinic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-zinc-300">Full Name</Label>
            <Input
              id="full_name"
              data-testid="booking-name-input"
              placeholder="e.g. Rohan Mehta"
              value={form.full_name}
              onChange={set("full_name")}
              className="bg-[#121212] border-zinc-800 text-white placeholder:text-zinc-600 h-12 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
            <Input
              id="phone"
              data-testid="booking-phone-input"
              type="tel"
              placeholder="e.g. 98XXXXXXXX"
              value={form.phone}
              onChange={set("phone")}
              className="bg-[#121212] border-zinc-800 text-white placeholder:text-zinc-600 h-12 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dob" className="text-zinc-300">Date of Birth</Label>
            <Input
              id="dob"
              data-testid="booking-dob-input"
              type="date"
              value={form.dob}
              onChange={set("dob")}
              max={new Date().toISOString().split("T")[0]}
              className="bg-[#121212] border-zinc-800 text-white h-12 focus-visible:ring-emerald-500 [color-scheme:dark]"
            />
          </div>
          <button
            type="submit"
            data-testid="booking-submit-btn"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-60 text-black font-bold py-4 text-base transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {submitting ? "Opening WhatsApp…" : "Send on WhatsApp"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

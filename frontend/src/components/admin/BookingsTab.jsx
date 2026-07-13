import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Loader2, CalendarClock } from "lucide-react";

export const BookingsTab = () => {
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    api.get("/admin/bookings").then((res) => setBookings(res.data));
  }, []);

  if (!bookings) return <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mt-10" />;

  return (
    <div data-testid="bookings-tab">
      <p className="text-sm text-zinc-400 mb-4">{bookings.length} booking request{bookings.length !== 1 && "s"} received via the WhatsApp form.</p>
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#121212] text-zinc-400 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Date of Birth</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={b.id} data-testid={`booking-row-${i}`} className="border-t border-zinc-900 text-zinc-200">
                <td className="px-4 py-3 font-medium">{b.full_name}</td>
                <td className="px-4 py-3">{b.phone}</td>
                <td className="px-4 py-3">{b.dob}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(b.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-10 text-center text-zinc-500"><CalendarClock className="w-6 h-6 mx-auto mb-2" />No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

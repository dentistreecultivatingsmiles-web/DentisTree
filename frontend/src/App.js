import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import Doctors from "@/components/site/Doctors";
import Reviews from "@/components/site/Reviews";
import Gallery from "@/components/site/Gallery";
import LocationSection from "@/components/site/LocationSection";
import Footer from "@/components/site/Footer";
import StickyBar from "@/components/site/StickyBar";
import BookingModal from "@/components/site/BookingModal";
import Admin from "@/pages/Admin";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [content, setContent] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/content`)
      .then((res) => setContent(res.data))
      .catch(() => toast.error("Could not load clinic content. Please refresh."));
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]" data-testid="loading-screen">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { clinic, services, doctors, reviews, gallery } = content;
  const openBooking = () => setBookingOpen(true);

  return (
    <div className="relative bg-[#050505] text-white pb-20 md:pb-0">
      <div className="noise-overlay" />
      <Header clinic={clinic} onBook={openBooking} />
      <main className="relative z-10">
        <Hero clinic={clinic} onBook={openBooking} />
        <Services services={services} onBook={openBooking} />
        <Doctors doctors={doctors} />
        <Reviews clinic={clinic} reviews={reviews} />
        <Gallery gallery={gallery} />
        <LocationSection clinic={clinic} />
      </main>
      <Footer clinic={clinic} />
      <StickyBar clinic={clinic} onBook={openBooking} />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} clinic={clinic} />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  date: string;
  time: string;
  location: string;
  zoom_link: string | null;
  capacity: number;
  registered: number;
  published: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    fetchEvents();
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Upcoming Events — SafetyTech Academy",
      description: "Join our upcoming webinars and masterclasses on AI, Safety 4.0, and modern EHS leadership. Free online events with industry experts.",
      canonical: "https://safetytech.academy/events",
    });
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 pt-28 pb-24 md:pt-32">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <h1 className="mb-4">
            Upcoming <span className="text-primary">Events</span>.
          </h1>
          <p className="text-lg text-[#69697b]">
            Join our community of safety leaders for interactive masterclasses, hands-on workshops, and expert-led discussions on AI, Safety 4.0, and modern EHS practices.
          </p>
        </div>

        {/* Events Grid */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12 text-[#69697b]">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-[#69697b]">
              No upcoming events. Check back soon!
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="group bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                  {/* Event Image */}
                  <div className="relative h-64 md:h-full rounded-[12px] overflow-hidden bg-gray-200 group-hover:scale-[1.02] transition-transform duration-300 flex-shrink-0">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#69697b]">
                        No image available
                      </div>
                    )}
                  </div>

                {/* Event Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0b0b2c] mb-3">
                      {event.title}
                    </h3>
                    <p className="text-[#69697b] mb-6 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-[#0b0b2c]">
                      <Calendar size={20} className="text-primary flex-shrink-0" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#0b0b2c]">
                      <Clock size={20} className="text-primary flex-shrink-0" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#0b0b2c]">
                      <MapPin size={20} className="text-primary flex-shrink-0" />
                      <span className="font-medium">{event.location}</span>
                    </div>

                    {/* Capacity Info */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-[#69697b]">
                        {event.registered} of {event.capacity} registered
                      </p>
                      <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{
                            width: `${(event.registered / event.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowRegistration(true);
                    }}
                    className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-[8px] hover:bg-[#2a2ad6] transition-colors duration-300"
                  >
                    Register Now
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-primary to-[#2a2ad6] rounded-[20px] p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Can't find the event you're looking for?</h2>
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to get notified about new events and exclusive invitations to upcoming masterclasses.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-[8px] text-[#0b0b2c] placeholder-[#69697b]"
            />
            <button className="bg-white text-primary font-semibold px-6 py-3 rounded-[8px] hover:bg-gray-50 transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistration && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => {
            setShowRegistration(false);
            setSelectedEvent(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default Events;

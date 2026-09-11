import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  zoom_link: string | null;
}

interface EventRegistrationModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventRegistrationModal({
  event,
  onClose,
}: EventRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.company || !formData.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Save lead to database
      const { error } = await supabase.from("leads").insert([
        {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          event_id: event.id,
          event_title: event.title,
          source: "event_registration",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Show success message
      setSubmitted(true);
      toast.success("Registration successful! Check your email for the Zoom link.");

      // Reset form after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#0b0b2c]">Register for Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} className="text-[#69697b]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0b0b2c] mb-2">
                Registration Confirmed!
              </h3>
              <p className="text-[#69697b] mb-4">
                We've sent a confirmation email with the Zoom meeting link to {formData.email}
              </p>
              <p className="text-sm text-[#94a3b8]">
                Closing in a few seconds...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0b0b2c] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0b0b2c] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0b0b2c] mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                  className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0b0b2c] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-[8px] hover:bg-[#2a2ad6] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register for Event"
                  )}
                </button>
              </div>

              <p className="text-xs text-[#94a3b8] text-center">
                We'll send you the Zoom link and event details to your email address.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

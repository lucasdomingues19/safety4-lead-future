import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "" // Honeypot field - bots will fill this
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already seen the popup this session
    const hasSeenPopup = sessionStorage.getItem("newsletter_popup_shown");
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("newsletter_popup_shown", "true");
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bot detected)
    if (formData.website) {
      console.log('Bot detected via honeypot');
      toast({
        title: "Welcome to the community!",
        description: "You've successfully subscribed to Safety Beyond Compliance.",
      });
      handleClose();
      return;
    }
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("capture-lead", {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
          source: "newsletter_popup",
          _hp: formData.website // Pass honeypot to server for additional check
        },
      });

      if (error) throw error;

      toast({
        title: "Welcome to the community!",
        description: "You've successfully subscribed to Safety Beyond Compliance.",
      });

      handleClose();
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-black border border-white/20 rounded-2xl p-8 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">
          Safety Beyond Compliance
        </h3>
        <p className="text-lime-400 font-semibold text-center mb-4">
          Newsletter
        </p>

        {/* Description */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          Join hundreds of safety innovators and changemakers receiving our bi-weekly newsletter.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-lime-400"
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-lime-400"
            />
          </div>
          {/* Honeypot field - hidden from users, visible to bots */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ 
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              height: 0,
              width: 0,
              pointerEvents: 'none'
            }}
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-lime-400"
          />
          <Input
            type="tel"
            placeholder="Phone Number (optional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-lime-400"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold py-3"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </form>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { countryCodes } from "@/data/countryCodes";

const BrochureDownloadModal = ({ open, onOpenChange }: BrochureDownloadModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+44",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: fullPhone,
            source: "brochure_download",
          }),
        }
      );

      if (!response.ok && response.status === 429) {
        toast({
          title: "Too many submissions",
          description: "Please try again later.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const link = document.createElement("a");
      link.href = "/Safety-4.0-Course-Brochure.pdf";
      link.download = "Safety-4.0-Course-Brochure.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started!",
        description: "Your brochure is downloading now.",
      });

      setFormData({ firstName: "", lastName: "", email: "", countryCode: "+44", phone: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error capturing lead:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us at hello@safetyacademy.tech",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileDown className="w-6 h-6 text-lime-400" />
            Download Brochure
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your details below to receive the Safety 4.0 Course Brochure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="First name"
                className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Last name"
                className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="bg-white/10 border-white/20 text-white placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData((p) => ({ ...p, countryCode: e.target.value }))}
                className="bg-white/10 border border-white/20 text-white rounded-md px-2 py-2 text-sm w-28 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code} className="bg-black text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="7911 123456"
                className="bg-white/10 border-white/20 text-white placeholder-gray-500 flex-1"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold text-base py-5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Download Brochure
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrochureDownloadModal;

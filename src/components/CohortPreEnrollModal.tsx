import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { countryCodes } from "@/data/countryCodes";

interface CohortPreEnrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CohortPreEnrollModal = ({ open, onOpenChange }: CohortPreEnrollModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+44",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();

      const { error: leadError } = await supabase.functions.invoke('capture-lead', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          source: 'cohort-pre-enrollment'
        }
      });

      if (leadError) throw leadError;

      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: fullPhone,
          message: `New Cohort Pre-Enrollment from ${formData.name}`,
          subject: 'New Cohort Pre-Enrollment'
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Success!",
        description: "We have your details and we'll be in touch soon. Thanks",
      });

      setFormData({ name: "", email: "", countryCode: "+44", phone: "" });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting pre-enrollment:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Save Your Spot in the Cohort</DialogTitle>
          <DialogDescription className="text-base text-white">
            Join our next live group training programme starting 2 September 2026. Fill in your details and we'll reach out with the schedule and next steps.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="bg-white/10 border border-white/20 text-white rounded-md px-2 py-2 text-sm w-28 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code} className="bg-black text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="7911 123456"
                className="flex-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reserving Your Spot...
              </>
            ) : (
              "Pre-reserve My Spot"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

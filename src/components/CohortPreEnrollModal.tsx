import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead to database
      const { error: leadError } = await supabase.functions.invoke('capture-lead', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          source: 'cohort-pre-enrollment'
        }
      });

      if (leadError) throw leadError;

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          message: `New Cohort Pre-Enrollment from ${formData.name}`,
          subject: 'New Cohort Pre-Enrollment'
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Spot Reserved! 🎉",
        description: "We'll be in touch soon with more details about the cohort program.",
      });

      // Reset form and close modal
      setFormData({ name: "", email: "", phone: "" });
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
          <DialogDescription className="text-base">
            Join our next live group training program. Fill in your details and we'll reach out with the schedule and next steps.
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
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 20 1234 5678"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reserving Your Spot...
              </>
            ) : (
              "Reserve My Spot"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

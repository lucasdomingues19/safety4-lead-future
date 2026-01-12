import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import bookCover from '@/assets/book-cover-safety-4-leader.jpg';

const EbookPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '' // Honeypot field - bots will fill this
  });
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('ebook_popup_shown');
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('ebook_popup_shown', 'true');
    }, 60000); // 1 minute

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
        title: "Success!",
        description: "Your eBook download will start shortly."
      });
      setIsOpen(false);
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('capture-lead', {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
          source: 'ebook_download',
          _hp: formData.website // Pass honeypot to server for additional check
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your eBook download will start shortly."
      });

      // Trigger download
      window.open('https://newsletter.getshield360.com/ebook', '_blank');
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-primary/20">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Book Cover */}
          <div className="md:w-2/5 p-6 flex items-center justify-center bg-gradient-to-b from-primary/20 to-transparent">
            <img
              src={bookCover}
              alt="Become the Safety 4.0 Leader eBook"
              className="w-40 md:w-full max-w-[180px] rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Form */}
          <div className="md:w-3/5 p-6 pt-8 md:pt-6">
            <div className="mb-4">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Free eBook</span>
              <h3 className="text-xl font-bold text-white mt-1">
                Become the Safety 4.0 Leader
              </h3>
              <p className="text-white/70 text-sm mt-2">
                Discover the strategies and mindset shifts needed to lead safety in the digital age.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Input
                type="tel"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
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
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Free eBook
                  </>
                )}
              </Button>
            </form>

            <p className="text-white/50 text-xs mt-3 text-center">
              By downloading, you agree to receive updates from Safety Academy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EbookPopup;

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import bookCover from '@/assets/book-cover-safety-4-leader.png';

const EbookPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('ebook_popup_shown');
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('ebook_popup_shown', 'true');
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-primary/20">
        <button
          onClick={() => setIsOpen(false)}
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

          {/* Content */}
          <div className="md:w-3/5 p-6 pt-8 md:pt-6 flex flex-col justify-center">
            <div className="mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Free eBook</span>
              <h3 className="text-xl font-bold text-white mt-1">
                Become the Safety 4.0 Leader
              </h3>
              <p className="text-white/70 text-sm mt-2">
                Discover the strategies and mindset shifts needed to lead safety in the digital age.
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <a href="https://learning.safetyacademy.tech/become-the-safety-4-0-leader" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Free eBook
              </a>
            </Button>

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

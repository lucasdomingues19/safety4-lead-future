import { useState, useEffect } from "react";

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Set target date to November 27, 2025
      const targetDate = new Date(2025, 10, 27); // Month 10 = November (0-indexed), day 27

      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-pink-500/20 to-lime-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
      <div className="text-center">
        <h3 className="text-white text-lg font-semibold mb-4">
          🚀 Academy Launching Soon
        </h3>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Days</div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Hours</div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Minutes</div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">Seconds</div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-white font-medium text-lg animate-pulse">
            Founding Member Special: Save £200 if you enroll today
          </p>
        </div>
      </div>
    </div>
  );
};
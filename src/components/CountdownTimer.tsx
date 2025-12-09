export const CountdownTimer = () => {
  const scrollToOffer = () => {
    const offerSection = document.getElementById('pricing');
    if (offerSection) {
      offerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-500/20 to-lime-500/20 backdrop-blur-sm border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
      <div className="text-center">
        <h3 className="text-white text-lg md:text-xl font-semibold mb-2 md:mb-3">
          🚀 The Academy has Launched
        </h3>
        
        <p className="text-lime-400 font-bold text-base md:text-lg mb-3 md:mb-4 animate-pulse">
          Founding Member Special: Save £200 if you enroll today
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-5 text-xs md:text-sm text-gray-200">
          <span className="flex items-center gap-1">
            <span className="text-lime-400">✓</span> Lifetime Access
          </span>
          <span className="flex items-center gap-1">
            <span className="text-lime-400">✓</span> 14-Day Money-Back
          </span>
          <span className="flex items-center gap-1">
            <span className="text-lime-400">✓</span> Expert Masterclasses
          </span>
        </div>
        
        <button
          onClick={scrollToOffer}
          className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-semibold px-5 md:px-6 py-2 md:py-2.5 rounded-full transition-all duration-300 hover:scale-105 text-sm md:text-base"
        >
          Join the Academy
        </button>
      </div>
    </div>
  );
};

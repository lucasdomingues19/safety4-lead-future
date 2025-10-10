import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating purple elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 via-purple-600/25 to-violet-500/20 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Purple blob - Top right */}
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/25 via-violet-500/30 to-purple-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom center */}
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/20 via-purple-500/25 to-purple-400/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-gray-300 mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

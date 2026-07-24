import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { setPageSEO } from "@/utils/seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    setPageSEO({
      title: "Page Not Found | SafetyTech Academy",
      description: "The page you're looking for doesn't exist. Return to SafetyTech Academy to explore IOSH-approved digital safety leadership training.",
    });
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900">404</h1>
        <p className="text-xl text-slate-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

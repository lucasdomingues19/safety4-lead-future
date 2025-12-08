import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Offer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/#pricing", { replace: true });
    
    // Small delay to ensure the page has loaded before scrolling
    setTimeout(() => {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [navigate]);

  return null;
};

export default Offer;

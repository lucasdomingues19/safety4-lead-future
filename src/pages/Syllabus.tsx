import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Syllabus = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to homepage with program section anchor
    navigate("/#program", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11113a] via-slate-900 to-black">
      <div className="text-white text-xl">Redirecting to curriculum...</div>
    </div>
  );
};

export default Syllabus;

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Award, Zap, Download, Star, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Question {
  id: number;
  category: string;
  text: string;
  options: { text: string; points: number }[];
}

const CATEGORIES = [
  "Awareness & Mindset",
  "Technology Adoption",
  "Risk & Compliance",
  "Change Management",
  "Leadership & Future Readiness",
] as const;

const LIKERT_OPTIONS = [
  { text: "Strongly Agree", points: 5 },
  { text: "Agree", points: 4 },
  { text: "Neutral", points: 3 },
  { text: "Disagree", points: 2 },
  { text: "Strongly Disagree", points: 1 },
];

const questions: Question[] = [
  // Awareness & Mindset (3 questions)
  { id: 1, category: "Awareness & Mindset", text: "I understand Safety 4.0 fundamentals (AI, IoT, Automation, Big Data, etc).", options: LIKERT_OPTIONS },
  { id: 2, category: "Awareness & Mindset", text: "I confidently discuss digital safety trends with leadership and teams.", options: LIKERT_OPTIONS },
  { id: 3, category: "Awareness & Mindset", text: "I stay up to date with emerging safety technologies and industry developments.", options: LIKERT_OPTIONS },

  // Technology Adoption (3 questions)
  { id: 4, category: "Technology Adoption", text: "I have hands-on experience with SafetyTech tools (e.g., wearables, AI tools like ChatGPT).", options: LIKERT_OPTIONS },
  { id: 5, category: "Technology Adoption", text: "I understand how predictive analytics enhances workplace safety outcomes.", options: LIKERT_OPTIONS },
  { id: 6, category: "Technology Adoption", text: "I can evaluate and select appropriate digital safety technologies for my organisation.", options: LIKERT_OPTIONS },

  // Risk & Compliance (3 questions)
  { id: 7, category: "Risk & Compliance", text: "I ensure safety technology aligns with compliance and ethical standards.", options: LIKERT_OPTIONS },
  { id: 8, category: "Risk & Compliance", text: "I know how to use AI for enhancing risk assessment and hazard identification.", options: LIKERT_OPTIONS },
  { id: 9, category: "Risk & Compliance", text: "I understand data privacy and cybersecurity implications of safety technologies.", options: LIKERT_OPTIONS },

  // Change Management (3 questions)
  { id: 10, category: "Change Management", text: "I confidently drive digital safety tool adoption and engage employees effectively.", options: LIKERT_OPTIONS },
  { id: 11, category: "Change Management", text: "I have implemented digital safety solutions successfully (e.g., EHS software).", options: LIKERT_OPTIONS },
  { id: 12, category: "Change Management", text: "I can build a business case for safety technology investment to senior leadership.", options: LIKERT_OPTIONS },

  // Leadership & Future Readiness (3 questions)
  { id: 13, category: "Leadership & Future Readiness", text: "I proactively seek digital safety upskilling opportunities.", options: LIKERT_OPTIONS },
  { id: 14, category: "Leadership & Future Readiness", text: "I lead digital transformation efforts in workplace safety confidently.", options: LIKERT_OPTIONS },
  { id: 15, category: "Leadership & Future Readiness", text: "I mentor others in adopting Safety 4.0 practices and technologies.", options: LIKERT_OPTIONS },
];

const getRank = (percentage: number): { rank: number; label: string; color: string; description: string } => {
  if (percentage >= 85) return { rank: 5, label: "Safety 4.0 Leader", color: "#22c55e", description: "You are at the forefront of digital safety transformation — a true Safety 4.0 leader." };
  if (percentage >= 70) return { rank: 4, label: "Advanced Practitioner", color: "#3b82f6", description: "You have strong Safety 4.0 capabilities with room for specialisation in key areas." };
  if (percentage >= 55) return { rank: 3, label: "Developing Professional", color: "#eab308", description: "You have a solid foundation but need deeper knowledge to advance your digital safety skills." };
  if (percentage >= 35) return { rank: 2, label: "Early Adopter", color: "#f97316", description: "You are beginning your Safety 4.0 journey — there is significant opportunity for growth." };
  return { rank: 1, label: "Beginner", color: "#ef4444", description: "You would greatly benefit from structured Safety 4.0 training to future-proof your career." };
};

export const Safety4AssessmentModal = ({ isOpen, onClose }: AssessmentModalProps) => {
  const [step, setStep] = useState<"assessment" | "capture" | "results">("assessment");
  const [userData, setUserData] = useState<UserData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnswerSelect = (points: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = points;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep("capture");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleUserDataSubmit = async () => {
    if (!userData.firstName || !userData.lastName || !userData.email) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            phone: userData.phone || null,
            source: "assessment",
          }),
        }
      );
      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many submissions. Please try again later.");
        } else {
          toast.error("Failed to save your information");
        }
        setIsSubmitting(false);
        return;
      }
      setStep("results");
      // Auto-send scorecard email after delay for DOM rendering
      const capturedData = { ...userData };
      const capturedAnswers = [...answers];
      setTimeout(async () => {
        try {
          const total = capturedAnswers.reduce((sum, s) => sum + s, 0);
          const overallPct = Math.round((total / (questions.length * 5)) * 100);
          const catScores = CATEGORIES.map((category) => {
            const categoryQs = questions.filter((q) => q.category === category);
            const totalPoints = categoryQs.reduce((sum, q) => {
              const idx = questions.indexOf(q);
              return sum + (capturedAnswers[idx] || 0);
            }, 0);
            const maxPoints = categoryQs.length * 5;
            const percentage = Math.round((totalPoints / maxPoints) * 100);
            return { category, percentage };
          });
          const rank = getRank(overallPct);

          let pdfBase64: string | undefined;
          try {
            pdfBase64 = await generatePdfBase64();
          } catch (e) {
            console.warn("PDF generation failed, sending without attachment:", e);
          }

          console.log("Auto-sending scorecard email to:", capturedData.email, "Score:", overallPct);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-scorecard-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({
                firstName: capturedData.firstName,
                lastName: capturedData.lastName,
                email: capturedData.email,
                overallScore: overallPct,
                rankNumber: rank.rank,
                rankLabel: rank.label,
                rankColor: rank.color,
                rankDescription: rank.description,
                categoryScores: catScores,
                pdfBase64,
              }),
            }
          );

          const responseData = await response.json();
          console.log("Scorecard email response:", response.status, responseData);
          if (response.ok) {
            toast.success("Results sent to your email!");
          }
        } catch (err) {
          console.error("Auto-send scorecard email failed:", err);
        }
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };


  const getCategoryScores = () => {
    return CATEGORIES.map((category) => {
      const categoryQs = questions.filter((q) => q.category === category);
      const totalPoints = categoryQs.reduce((sum, q) => {
        const idx = questions.indexOf(q);
        return sum + (answers[idx] || 0);
      }, 0);
      const maxPoints = categoryQs.length * 5;
      const percentage = Math.round((totalPoints / maxPoints) * 100);
      return { category, score: totalPoints, maxScore: maxPoints, percentage };
    });
  };

  const getOverallPercentage = () => {
    const total = answers.reduce((sum, s) => sum + s, 0);
    return Math.round((total / (questions.length * 5)) * 100);
  };

  const getRadarData = () => {
    const scores = getCategoryScores();
    return scores.map((s) => ({
      category: s.category.replace("& ", "&\n"),
      shortName: s.category.split(" ")[0],
      "Your Score": s.percentage,
      "Target": 100,
    }));
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const base64 = await generatePdfBase64();
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Safety-4.0-Scorecard-${userData.firstName}-${userData.lastName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your scorecard PDF has been downloaded!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generatePdfBase64 = async (): Promise<string> => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const overallPct = getOverallPercentage();
    const rankInfo = getRank(overallPct);
    const catScores = getCategoryScores();

    // --- Header with logo ---
    doc.setFillColor(17, 17, 58);
    doc.rect(0, 0, pageWidth, 32, "F");

    // Add academy logo to header (RIGHT side)
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject();
        logoImg.src = "/favicon.png";
      });
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = logoImg.naturalWidth;
      logoCanvas.height = logoImg.naturalHeight;
      const ctx = logoCanvas.getContext("2d");
      ctx?.drawImage(logoImg, 0, 0);
      const logoData = logoCanvas.toDataURL("image/png");
      doc.addImage(logoData, "PNG", pageWidth - margin - 20, 6, 20, 20);
    } catch {
      // Logo failed to load, continue without it
    }

    doc.setTextColor(214, 255, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Safety 4.0 Readiness Scorecard", margin, 14);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${userData.firstName} ${userData.lastName}  |  ${userData.email}  |  ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, 24);

    let y = 36;

    // --- Side-by-side: Radar chart (left) + Score/Rank boxes (right) ---
    const chartEl = document.getElementById("scorecard-radar-chart");
    const chartColWidth = contentWidth * 0.68;
    const infoColWidth = contentWidth * 0.28;
    const infoX = margin + chartColWidth + contentWidth * 0.04;

    if (chartEl) {
      const canvas = await html2canvas(chartEl, { backgroundColor: "#ffffff", scale: 3 });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height / canvas.width) * chartColWidth;
      doc.addImage(imgData, "PNG", margin, y, chartColWidth, imgHeight);

      // Score box (right column, top)
      const boxHeight = 28;
      const boxGap = 4;
      const scoreBoxY = y + 4;

      doc.setFillColor(245, 245, 245);
      doc.roundedRect(infoX, scoreBoxY, infoColWidth, boxHeight, 3, 3, "F");
      doc.setTextColor(17, 17, 58);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text(`${overallPct}`, infoX + infoColWidth / 2, scoreBoxY + boxHeight / 2 - 2, { align: "center", baseline: "middle" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("OVERALL SCORE / 100", infoX + infoColWidth / 2, scoreBoxY + boxHeight / 2 + 7, { align: "center", baseline: "middle" });

      // Rank box (right column, below score)
      const rankBoxY = scoreBoxY + boxHeight + boxGap;
      const rankBoxHeight = 32;
      const hex = rankInfo.color.replace("#", "");
      doc.setFillColor(parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16));
      doc.roundedRect(infoX, rankBoxY, infoColWidth, rankBoxHeight, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      // Draw star circles instead of unicode stars (not supported by default fonts)
      const starRadius = 2.5;
      const starGap = 1.5;
      const totalStarsWidth = 5 * (starRadius * 2) + 4 * starGap;
      const starStartX = infoX + (infoColWidth - totalStarsWidth) / 2 + starRadius;
      const starCenterY = rankBoxY + 8;
      for (let i = 0; i < 5; i++) {
        const cx = starStartX + i * (starRadius * 2 + starGap);
        if (i < rankInfo.rank) {
          doc.setFillColor(255, 255, 255);
          doc.circle(cx, starCenterY, starRadius, "F");
        } else {
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.4);
          doc.circle(cx, starCenterY, starRadius, "S");
        }
      }
      doc.setFontSize(10);
      const rankLabelLines = doc.splitTextToSize(rankInfo.label, infoColWidth - 8);
      doc.text(rankLabelLines, infoX + infoColWidth / 2, rankBoxY + 14, { align: "center" });
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(rankInfo.description, infoColWidth - 8);
      doc.text(descLines, infoX + infoColWidth / 2, rankBoxY + 22, { align: "center" });

      y += Math.max(imgHeight, scoreBoxY - y + boxHeight + boxGap + rankBoxHeight) + 6;
    }

    // --- Category Breakdown ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 17, 58);
    doc.text("Category Breakdown", margin, y);
    y += 5;

    catScores.forEach((cat) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(cat.category, margin, y + 4);
      doc.text(`${cat.percentage}%`, margin + contentWidth, y + 4, { align: "right" });
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(margin, y + 6, contentWidth, 3, 1.5, 1.5, "F");
      const barWidth = (cat.percentage / 100) * contentWidth;
      const catRank = getRank(cat.percentage);
      const h = catRank.color.replace("#", "");
      doc.setFillColor(parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16));
      doc.roundedRect(margin, y + 6, Math.max(barWidth, 2), 3, 1.5, 1.5, "F");
      y += 13;
    });
    y += 3;

    // --- CTA box ---
    doc.setFillColor(17, 17, 58);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");
    doc.setTextColor(214, 255, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Ready to Level Up?", margin + 8, y + 8);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Join the Safety 4.0 Academy — the world's first IOSH-approved Safety 4.0 certification program.", margin + 8, y + 14);
    doc.setTextColor(214, 255, 0);
    doc.setFont("helvetica", "bold");
    doc.text("www.safetyacademy.tech/enroll", margin + 8, y + 19);

    // --- Footer with hyperlinked enroll URL ---
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("© Safety 4.0 Academy", pageWidth / 2 - 20, pageHeight - 8);
    doc.setTextColor(60, 120, 200);
    doc.setFont("helvetica", "bold");
    const enrollUrl = "https://www.safetyacademy.tech/enroll";
    const enrollText = "www.safetyacademy.tech/enroll";
    const footerTextWidth = doc.getTextWidth(enrollText);
    const footerLinkX = pageWidth / 2 + 10;
    doc.text(enrollText, footerLinkX, pageHeight - 8);
    doc.link(footerLinkX, pageHeight - 11, footerTextWidth, 5, { url: enrollUrl });

    return doc.output("datauristring").split(",")[1];
  };

  const sendResultsEmail = async () => {
    setIsSendingEmail(true);
    try {
      const overallPct = getOverallPercentage();
      const rank = getRank(overallPct);
      const catScores = getCategoryScores();

      // Try PDF generation, but send email even if it fails
      let pdfBase64: string | undefined;
      try {
        pdfBase64 = await generatePdfBase64();
      } catch (pdfError) {
        console.warn("PDF generation failed, sending email without attachment:", pdfError);
      }

      console.log("Sending scorecard email to:", userData.email, "Score:", overallPct);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-scorecard-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            overallScore: overallPct,
            rankNumber: rank.rank,
            rankLabel: rank.label,
            rankColor: rank.color,
            rankDescription: rank.description,
            categoryScores: catScores.map((c) => ({
              category: c.category,
              percentage: c.percentage,
            })),
            pdfBase64,
          }),
        }
      );

      const responseData = await response.json();
      console.log("Scorecard email response:", response.status, responseData);

      if (!response.ok) throw new Error("Failed to send email");
      setEmailSent(true);
      toast.success("Results sent to your email!");
    } catch (error) {
      console.error("Error sending scorecard email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const resetAssessment = () => {
    setStep("assessment");
    setCurrentQuestion(0);
    setAnswers([]);
    setUserData({ firstName: "", lastName: "", email: "", phone: "" });
    setEmailSent(false);
  };

  const handleClose = () => {
    resetAssessment();
    onClose();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const overallPercentage = step === "results" ? getOverallPercentage() : 0;
  const rankInfo = step === "results" ? getRank(overallPercentage) : null;
  const categoryScores = step === "results" ? getCategoryScores() : [];
  const radarData = step === "results" ? getRadarData() : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {step === "assessment" && "Safety 4.0 Readiness Scorecard"}
            {step === "capture" && "Unlock Your Results"}
            {step === "results" && "Your Safety 4.0 Readiness Results"}
          </DialogTitle>
        </DialogHeader>

        {/* Assessment Questions */}
        {step === "assessment" && (
          <div className="space-y-6 p-4 md:p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#D6FF00]/20 text-[#D6FF00]">
                  {questions[currentQuestion].category}
                </span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg md:text-xl font-semibold text-white leading-relaxed">
                {questions[currentQuestion].text}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option.points)}
                    className={`w-full p-4 text-left border rounded-xl transition-all duration-200 text-white hover:scale-[1.01] ${
                      answers[currentQuestion] === option.points
                        ? "border-[#D6FF00] bg-[#D6FF00]/15 shadow-lg shadow-[#D6FF00]/10"
                        : "border-slate-600 hover:border-slate-400 hover:bg-slate-700/50"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {answers[currentQuestion] !== undefined && currentQuestion < questions.length - 1 && (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="bg-[#D6FF00] text-black hover:bg-[#c5ee00]"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Capture */}
        {step === "capture" && (
          <div className="space-y-6 p-4 md:p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-[#D6FF00]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Assessment Complete!</h3>
              <p className="text-gray-400">
                Enter your details to unlock your personalised Safety 4.0 Readiness Score, spider chart, and detailed breakdown.
              </p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                <Input id="firstName" value={userData.firstName} onChange={(e) => setUserData({ ...userData, firstName: e.target.value })} placeholder="Enter your first name" className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                <Input id="lastName" value={userData.lastName} onChange={(e) => setUserData({ ...userData, lastName: e.target.value })} placeholder="Enter your last name" className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                <Input id="email" type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} placeholder="Enter your email address" className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-300">Phone Number (optional)</Label>
                <Input id="phone" type="tel" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} placeholder="Enter your phone number" className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <Button
                onClick={handleUserDataSubmit}
                className="w-full mt-4 bg-[#D6FF00] text-black hover:bg-[#c5ee00] py-5 text-base font-semibold"
                disabled={!userData.firstName || !userData.lastName || !userData.email || isSubmitting}
              >
                {isSubmitting ? "Loading..." : "Unlock My Results"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Results with Spider Chart */}
        {step === "results" && rankInfo && (
          <div className="space-y-8 p-4 md:p-6" ref={resultsRef}>
            {/* Rank & Score Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-7 h-7 ${s <= rankInfo.rank ? "fill-[#D6FF00] text-[#D6FF00]" : "text-slate-600"}`}
                  />
                ))}
              </div>
              <h3 className="text-3xl font-bold" style={{ color: rankInfo.color }}>
                {rankInfo.label}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">{rankInfo.description}</p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{overallPercentage}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Score / 100</div>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: rankInfo.color }}>{rankInfo.rank}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Rank / 5</div>
                </div>
              </div>
            </div>

            {/* Spider Chart */}
            <div className="bg-white rounded-2xl p-4 md:p-6" id="scorecard-radar-chart">
              <h4 className="text-center font-semibold text-sm text-gray-700 mb-2">
                Your Safety 4.0 Readiness Profile
              </h4>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="shortName"
                    tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 9 }}
                    tickCount={6}
                  />
                  <Radar
                    name="Target (100%)"
                    dataKey="Target"
                    stroke="#d1d5db"
                    fill="#e5e7eb"
                    fillOpacity={0.25}
                    strokeDasharray="4 4"
                  />
                  <Radar
                    name="Your Score"
                    dataKey="Your Score"
                    stroke="#11113a"
                    fill="#D6FF00"
                    fillOpacity={0.45}
                    strokeWidth={2}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Category Breakdown</h4>
              {categoryScores.map((cat, idx) => {
                const catRank = getRank(cat.percentage);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{cat.category}</span>
                      <span className="font-bold" style={{ color: catRank.color }}>{cat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${cat.percentage}%`, backgroundColor: catRank.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Download PDF */}
            <div className="flex justify-center">
              <Button
                onClick={generatePdf}
                disabled={isGeneratingPdf}
                className="bg-white text-slate-900 hover:bg-gray-100 py-5 text-base font-semibold w-full sm:w-auto sm:px-12"
              >
                <Download className="w-5 h-5 mr-2" />
                {isGeneratingPdf ? "Generating..." : "Download PDF"}
              </Button>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#D6FF00]/20 to-[#D6FF00]/5 border border-[#D6FF00]/30 rounded-xl p-6 text-center">
              <Zap className="w-10 h-10 mx-auto mb-3 text-[#D6FF00]" />
              <h4 className="font-semibold text-lg mb-2 text-white">Ready to Level Up?</h4>
              <p className="text-gray-400 mb-4 text-sm">
                Join the Safety 4.0 Academy and transform your career with the world's first IOSH-approved Safety 4.0 program.
              </p>
              <Button
                className="bg-[#D6FF00] text-black hover:bg-[#c5ee00]"
                onClick={() => {
                  handleClose();
                  window.location.href = "/enroll";
                }}
              >
                Enrol Now
              </Button>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={resetAssessment} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Retake Assessment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

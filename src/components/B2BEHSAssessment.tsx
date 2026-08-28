import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { countryCodes } from "@/data/countryCodes";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Question {
  id: number;
  category: string;
  text: string;
  options: { text: string; points: number }[];
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  organizationName: string;
  ehs_team_size: string;
  emailConsent: boolean;
}

const CATEGORIES = [
  "Awareness & Strategy",
  "Technology Readiness",
  "Governance & Risk",
  "Change Management",
  "Leadership & Investment",
] as const;

const LIKERT_OPTIONS = [
  { text: "Strongly Agree", points: 5 },
  { text: "Agree", points: 4 },
  { text: "Neutral", points: 3 },
  { text: "Disagree", points: 2 },
  { text: "Strongly Disagree", points: 1 },
];

const questions: Question[] = [
  // Awareness & Strategy (3 questions)
  { id: 1, category: "Awareness & Strategy", text: "Our EHS team understands Safety 4.0 fundamentals (AI, IoT, automation, big data) and their potential applications in workplace safety.", options: LIKERT_OPTIONS },
  { id: 2, category: "Awareness & Strategy", text: "Our organization has a clear strategy for integrating AI and digital tools into our EHS function.", options: LIKERT_OPTIONS },
  { id: 3, category: "Awareness & Strategy", text: "Leadership actively supports exploring safety technology as part of our digital transformation roadmap.", options: LIKERT_OPTIONS },

  // Technology Readiness (3 questions)
  { id: 4, category: "Technology Readiness", text: "Our EHS team has hands-on experience with SafetyTech tools (wearables, AI-powered analytics, digital inspection platforms).", options: LIKERT_OPTIONS },
  { id: 5, category: "Technology Readiness", text: "We use data analytics to identify safety risks and predict incidents before they happen.", options: LIKERT_OPTIONS },
  { id: 6, category: "Technology Readiness", text: "Our safety systems are integrated and capable of adopting new digital solutions without major disruption.", options: LIKERT_OPTIONS },

  // Governance & Risk (3 questions)
  { id: 7, category: "Governance & Risk", text: "We have clear governance processes to evaluate and approve new safety technologies for compliance and ethical standards.", options: LIKERT_OPTIONS },
  { id: 8, category: "Governance & Risk", text: "Our team understands data privacy, cybersecurity, and AI bias risks related to safety technology implementation.", options: LIKERT_OPTIONS },
  { id: 9, category: "Governance & Risk", text: "We have established protocols for managing worker privacy and trust when implementing monitoring or AI-driven tools.", options: LIKERT_OPTIONS },

  // Change Management (3 questions)
  { id: 10, category: "Change Management", text: "Our EHS team is confident in driving adoption of new digital tools and engaging frontline workers effectively.", options: LIKERT_OPTIONS },
  { id: 11, category: "Change Management", text: "We have successfully implemented digital safety solutions (EHS software, reporting platforms, dashboards) in the past.", options: LIKERT_OPTIONS },
  { id: 12, category: "Change Management", text: "We can develop a compelling business case for safety technology investments to senior leadership and secure budget approval.", options: LIKERT_OPTIONS },

  // Leadership & Investment (3 questions)
  { id: 13, category: "Leadership & Investment", text: "Our EHS leaders actively pursue training and upskilling in digital transformation and AI literacy.", options: LIKERT_OPTIONS },
  { id: 14, category: "Leadership & Investment", text: "Our organization allocates dedicated budget for evaluating and piloting new safety technologies.", options: LIKERT_OPTIONS },
  { id: 15, category: "Leadership & Investment", text: "We benchmark our EHS digital maturity against industry peers and have a clear roadmap for advancement.", options: LIKERT_OPTIONS },
];

const getRank = (percentage: number): { rank: number; label: string; color: string; description: string } => {
  if (percentage >= 85) return { rank: 5, label: "AI-Ready Leader", color: "#22c55e", description: "Your EHS function is positioned as a leader in AI and digital transformation. You have the capability, governance, and leadership to drive innovation responsibly." };
  if (percentage >= 70) return { rank: 4, label: "Advanced Capability", color: "#3b82f6", description: "Your team has solid foundations for AI adoption with good technology readiness and governance. Focus on scaling and strategic investment." };
  if (percentage >= 55) return { rank: 3, label: "Developing Readiness", color: "#eab308", description: "Your organization is on the right path but needs to strengthen specific capabilities — particularly in governance, change management, or strategic alignment." };
  if (percentage >= 35) return { rank: 2, label: "Early Stage", color: "#f97316", description: "You have recognized the importance of Safety 4.0 but need foundational work across awareness, governance, and technology readiness." };
  return { rank: 1, label: "Foundation Building", color: "#ef4444", description: "Your EHS function would benefit from structured capability-building to support AI and digital transformation adoption." };
};

const MATURITY_DIMENSIONS = [
  { id: "strategy", label: "Strategy & Vision", mappedCategory: "Awareness & Strategy" },
  { id: "technology", label: "Technology", mappedCategory: "Technology Readiness" },
  { id: "governance", label: "Governance", mappedCategory: "Governance & Risk" },
  { id: "adoption", label: "Change Management", mappedCategory: "Change Management" },
  { id: "investment", label: "Leadership & Investment", mappedCategory: "Leadership & Investment" },
] as const;

export const B2BEHSAssessment = () => {
  const [step, setStep] = useState<"assessment" | "capture" | "results">("assessment");
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+44",
    phone: "",
    organizationName: "",
    ehs_team_size: "",
    emailConsent: false,
  });
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
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone || !userData.organizationName) {
      toast.error("Please complete all fields");
      return;
    }
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
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: `${userData.phoneCode}${userData.phone}`,
            organizationName: userData.organizationName,
            source: "ehs-assessment",
            metadata: { assessment_type: "b2b-ehs-maturity" },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save lead");
      setStep("results");
    } catch (error) {
      toast.error("Error saving your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCategoryScores = () => {
    const categoryScores = CATEGORIES.map((cat) => {
      const categoryQuestions = questions.filter((q) => q.category === cat);
      const categoryAnswers = categoryQuestions.map((q) => answers[q.id - 1] || 0);
      const avg = categoryAnswers.length > 0 ? Math.round((categoryAnswers.reduce((a, b) => a + b) / (categoryAnswers.length * 5)) * 100) : 0;
      return { category: cat, score: avg };
    });
    return categoryScores;
  };

  const calculateOverallScore = () => {
    const totalPoints = answers.reduce((a, b) => a + b, 0);
    const maxPoints = questions.length * 5;
    return Math.round((totalPoints / maxPoints) * 100);
  };

  const overallScore = calculateOverallScore();
  const categoryScores = calculateCategoryScores();
  const rankInfo = getRank(overallScore);

  const getRadarData = () => {
    return MATURITY_DIMENSIONS.map((dim) => {
      const categoryScore = categoryScores.find((cs) => cs.category === dim.mappedCategory);
      return {
        dimension: dim.label,
        score: categoryScore?.score || 0,
      };
    });
  };

  if (step === "assessment") {
    const question = questions[currentQuestion];
    const isAnswered = answers[currentQuestion] !== undefined;

    return (
      <div className="min-h-screen bg-white text-slate-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-mono uppercase tracking-[0.16em] text-primary mb-2">EHS AI Readiness Assessment</div>
                  <h1 className="text-3xl font-bold text-slate-900">Question {currentQuestion + 1} of {questions.length}</h1>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</div>
                  <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-500 mt-4">
                Category: {question.category}
              </div>
            </div>

            {/* Question */}
            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
                {question.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option.points)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all font-medium ${
                      answers[currentQuestion] === option.points
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/30"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              {isAnswered && (
                <Button
                  onClick={() => handleAnswerSelect(answers[currentQuestion])}
                  className="ml-auto gap-2 bg-primary text-white hover:bg-primary/90"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "capture") {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Get Your Detailed Report</h1>
            <p className="text-lg text-slate-600 mb-8">
              Share your details to receive your personalized EHS AI Readiness assessment report.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="your@company.com"
                />
              </div>

              <div>
                <Label htmlFor="organizationName" className="block text-sm font-medium mb-2">
                  Organization Name *
                </Label>
                <Input
                  id="organizationName"
                  value={userData.organizationName}
                  onChange={(e) => setUserData({ ...userData, organizationName: e.target.value })}
                  placeholder="Your organization"
                />
              </div>

              <div>
                <Label htmlFor="ehs_team_size" className="block text-sm font-medium mb-2">
                  EHS Team Size
                </Label>
                <select
                  id="ehs_team_size"
                  value={userData.ehs_team_size}
                  onChange={(e) => setUserData({ ...userData, ehs_team_size: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select team size</option>
                  <option value="1">1 person</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="10+">10+ people</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label htmlFor="phoneCode" className="block text-sm font-medium mb-2">
                    Country Code *
                  </Label>
                  <select
                    id="phoneCode"
                    value={userData.phoneCode}
                    onChange={(e) => setUserData({ ...userData, phoneCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    {countryCodes.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={userData.emailConsent}
                  onChange={(e) => setUserData({ ...userData, emailConsent: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>I'm happy to receive insights about EHS digital transformation</span>
              </label>

              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("assessment")}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleUserDataSubmit}
                  disabled={isSubmitting}
                  className="ml-auto bg-primary text-white hover:bg-primary/90"
                >
                  {isSubmitting ? "Saving..." : "Get My Report"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div ref={resultsRef} className="max-w-4xl mx-auto">
          {/* Overall Score */}
          <div className="bg-white rounded-xl p-8 mb-8 border border-slate-200">
            <div className="text-center mb-8">
              <div className="text-sm font-mono uppercase tracking-[0.16em] text-primary mb-4">Your Results</div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{overallScore}%</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: rankInfo.color }}
                />
                <span className="font-bold text-lg">{rankInfo.label}</span>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{rankInfo.description}</p>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-xl p-8 mb-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Capability Maturity by Dimension</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={getRadarData()}>
                  <PolarGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Radar
                    name="Maturity Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {categoryScores.map((cat) => (
              <div key={cat.category} className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3">{cat.category}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mr-4">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-lg text-slate-900">{cat.score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What's Next?</h2>
            <p className="text-slate-600 mb-6">
              Your assessment reveals specific capability gaps and opportunities. Our Safety 4.0 programme is designed to address exactly these challenges across your EHS team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Discuss Your Results
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BEHSAssessment;

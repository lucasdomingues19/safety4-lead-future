import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Award, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface Question {
  id: number;
  category: string;
  text: string;
  options: { text: string; points: number }[];
}

const questions: Question[] = [
  // Awareness & Mindset (2 questions)
  {
    id: 1,
    category: "Awareness & Mindset",
    text: "I understand Safety 4.0 fundamentals (Artificial Intelligence, Internet of Things, Automation, Big Data, etc).",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 2,
    category: "Awareness & Mindset",
    text: "I confidently discuss digital safety with leadership and teams.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  // Technology Adoption (2 questions)
  {
    id: 3,
    category: "Technology Adoption",
    text: "I have hands-on experience with SafetyTech tools (e.g., wearables, AI tools like ChatGPT, etc).",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 4,
    category: "Technology Adoption",
    text: "I understand how predictive analytics enhances safety.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  // Risk & Compliance (2 questions)
  {
    id: 5,
    category: "Risk & Compliance",
    text: "I ensure how safety technology aligns with compliance and ethical standards.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 6,
    category: "Risk & Compliance",
    text: "I know how to use AI for enhancing risk assessment and hazard identification.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  // Change Management (2 questions)
  {
    id: 7,
    category: "Change Management",
    text: "I confidently drive digital safety tool adoption and engage employees effectively.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 8,
    category: "Change Management",
    text: "I have implemented digital safety solutions successfully (e.g., EHS software).",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  // Leadership & Future Readiness (2 questions)
  {
    id: 9,
    category: "Leadership & Future Readiness",
    text: "I proactively seek digital safety upskilling opportunities.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 10,
    category: "Leadership & Future Readiness",
    text: "I lead digital transformation efforts in workplace safety confidently.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  }
];

export const Safety4AssessmentModal = ({ isOpen, onClose }: AssessmentModalProps) => {
  // New flow: assessment -> capture -> results
  const [step, setStep] = useState<'assessment' | 'capture' | 'results'>('assessment');
  const [userData, setUserData] = useState<UserData>({ firstName: '', lastName: '', email: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (points: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = points;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Assessment complete, go to lead capture
      setStep('capture');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleUserDataSubmit = async () => {
    if (userData.firstName && userData.lastName && userData.email) {
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              phone: '',
              source: 'assessment'
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error saving lead:', errorData);
          
          if (response.status === 429) {
            toast.error('Too many submissions. Please try again later.');
          } else {
            toast.error('Failed to save your information');
          }
          setIsSubmitting(false);
          return;
        }

        setStep('results');
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const calculateResults = () => {
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 5; // 10 questions * 5 points max
    const percentage = (totalScore / maxScore) * 100;

    if (percentage >= 90) return { level: 'Expert', color: 'text-green-500', description: 'You are a Safety 4.0 leader with advanced digital expertise' };
    if (percentage >= 75) return { level: 'Advanced', color: 'text-blue-500', description: 'You have strong Safety 4.0 knowledge with room for specialization' };
    if (percentage >= 60) return { level: 'Intermediate', color: 'text-yellow-500', description: 'You understand Safety 4.0 basics but need more advanced skills' };
    if (percentage >= 40) return { level: 'Developing', color: 'text-orange-500', description: 'You are beginning your Safety 4.0 journey' };
    return { level: 'Beginner', color: 'text-red-500', description: 'You would greatly benefit from Safety 4.0 training' };
  };

  const getCategoryScores = () => {
    const categories = ['Awareness & Mindset', 'Technology Adoption', 'Risk & Compliance', 'Change Management', 'Leadership & Future Readiness'];
    
    return categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryAnswers = categoryQuestions.map((_, idx) => {
        const questionIndex = questions.findIndex(q => q.category === category && q === categoryQuestions[idx]);
        return answers[questionIndex] || 0;
      });
      const score = categoryAnswers.reduce((sum, points) => sum + points, 0);
      const maxScore = categoryQuestions.length * 5;
      const percentage = Math.round((score / maxScore) * 100);
      
      return { category, score, percentage };
    });
  };

  const resetAssessment = () => {
    setStep('assessment');
    setCurrentQuestion(0);
    setAnswers([]);
    setUserData({ firstName: '', lastName: '', email: '' });
  };

  const handleClose = () => {
    resetAssessment();
    onClose();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const results = step === 'results' ? calculateResults() : null;
  const categoryScores = step === 'results' ? getCategoryScores() : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 'assessment' && 'Safety 4.0 Readiness Assessment'}
            {step === 'capture' && 'Get Your Results'}
            {step === 'results' && 'Your Safety 4.0 Readiness Results'}
          </DialogTitle>
        </DialogHeader>

        {/* Assessment Questions - Now First Step */}
        {step === 'assessment' && (
          <div className="space-y-6 p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-sm font-medium text-white">{questions[currentQuestion].category}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">{questions[currentQuestion].text}</h3>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option.points)}
                    className={`w-full p-4 text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-white ${
                      answers[currentQuestion] === option.points ? 'border-primary bg-primary/20 text-primary-foreground' : 'border-border'
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
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {answers[currentQuestion] && currentQuestion < questions.length - 1 && (
                  <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Capture Form - After Assessment */}
        {step === 'capture' && (
          <div className="space-y-6 p-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-[#D6FF00]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Assessment Complete!</h3>
              <p className="text-muted-foreground mb-6">Enter your details below to see your personalized Safety 4.0 Readiness Score and detailed breakdown.</p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <Button 
                onClick={handleUserDataSubmit} 
                className="w-full mt-6 bg-[#D6FF00] text-black hover:bg-[#c5ee00]"
                disabled={!userData.firstName || !userData.lastName || !userData.email || isSubmitting}
              >
                {isSubmitting ? 'Loading...' : 'See My Results'} 
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'results' && results && (
          <div className="space-y-8 p-6">
            <div className="text-center">
              <Award className={`w-20 h-20 mx-auto mb-4 ${results.color}`} />
              <h3 className={`text-3xl font-bold ${results.color}`}>{results.level}</h3>
              <p className="text-muted-foreground mt-2">{results.description}</p>
              <div className="mt-4 text-2xl font-bold text-white">
                Score: {answers.reduce((sum, score) => sum + score, 0)}/{questions.length * 5}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Category Breakdown
              </h4>
              {categoryScores.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{cat.category}</span>
                    <span className="font-medium text-white">{cat.percentage}%</span>
                  </div>
                  <Progress value={cat.percentage} className="h-2" />
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#D6FF00]/20 to-[#D6FF00]/10 border border-[#D6FF00]/30 rounded-lg p-6 text-center">
              <Zap className="w-10 h-10 mx-auto mb-3 text-[#D6FF00]" />
              <h4 className="font-semibold text-lg mb-2 text-white">Ready to Level Up?</h4>
              <p className="text-muted-foreground mb-4">
                Join the Safety 4.0 Academy and transform your career with the world's first IOSH-approved Safety 4.0 program.
              </p>
              <Button 
                className="bg-[#D6FF00] text-black hover:bg-[#c5ee00]"
                onClick={() => {
                  handleClose();
                  setTimeout(() => {
                    const pricingSection = document.getElementById("pricing");
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }}
              >
                View Founding Member Offer
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetAssessment}>
                Retake Assessment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

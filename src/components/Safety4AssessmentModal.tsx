import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Award, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface Question {
  id: number;
  category: string;
  text: string;
  options: { text: string; points: number }[];
}

const questions: Question[] = [
  // Awareness & Mindset (4 questions)
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
    text: "I confidently interpret safety data for informed decisions.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 3,
    category: "Awareness & Mindset",
    text: "I stay updated on emerging digital safety trends.",
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
  // Technology Adoption (4 questions)
  {
    id: 5,
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
    id: 6,
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
  {
    id: 7,
    category: "Technology Adoption",
    text: "I can evaluate and recommend SafetyTech solutions based on business needs.",
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
    category: "Technology Adoption",
    text: "I recognise human and operational factors influencing SafetyTech success.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  // Risk & Compliance (4 questions)
  {
    id: 9,
    category: "Risk & Compliance",
    text: "I ensure safety technology aligns with compliance and ethical standards.",
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
    category: "Risk & Compliance",
    text: "I am aware of cybersecurity risks in digital safety solutions.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 11,
    category: "Risk & Compliance",
    text: "I integrate human and operational factors into SafetyTech adoption strategies.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 12,
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
  // Change Management (5 questions)
  {
    id: 13,
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
    id: 14,
    category: "Change Management",
    text: "I manage workforce concerns about new technology positively.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 15,
    category: "Change Management",
    text: "I promote SafetyTech as an enabler of safer workplaces.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 16,
    category: "Change Management",
    text: "I have implemented digital safety solutions successfully (i.e EHS software, etc).",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 17,
    category: "Change Management",
    text: "I position myself as a forward-thinking safety leader open to embrace the digital age.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  // Leadership & Future Readiness (3 questions)
  {
    id: 18,
    category: "Leadership & Future Readiness",
    text: "I align Safety 4.0 initiatives with business goals and strategies.",
    options: [
      { text: "Strongly Agree", points: 5 },
      { text: "Agree", points: 4 },
      { text: "Neutral", points: 3 },
      { text: "Disagree", points: 2 },
      { text: "Strongly Disagree", points: 1 }
    ]
  },
  {
    id: 19,
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
    id: 20,
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
  const [step, setStep] = useState<'capture' | 'assessment' | 'results'>('capture');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', phone: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleUserDataSubmit = async () => {
    if (userData.name && userData.email && userData.phone) {
      // Save lead to database
      try {
        const { error } = await supabase
          .from('leads')
          .insert([
            {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              source: 'assessment'
            }
          ]);

        if (error) {
          console.error('Error saving lead:', error);
          toast.error('Failed to save your information');
          return;
        }

        setStep('assessment');
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred');
      }
    }
  };

  const handleAnswerSelect = (points: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = points;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('results');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    const percentage = (totalScore / 100) * 100;

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
    setStep('capture');
    setCurrentQuestion(0);
    setAnswers([]);
    setUserData({ name: '', email: '', phone: '' });
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
            {step === 'capture' && 'Safety 4.0 Readiness Assessment'}
            {step === 'assessment' && 'Safety 4.0 Assessment'}
            {step === 'results' && 'Your Safety 4.0 Readiness Results'}
          </DialogTitle>
        </DialogHeader>

        {/* Lead Capture Form */}
        {step === 'capture' && (
          <div className="space-y-6 p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-4 text-white">Discover Your Safety 4.0 Readiness Level</h3>
              <p className="text-muted-foreground mb-6">Get your personalized assessment and unlock your path to becoming a Safety 4.0 leader. This comprehensive 20-question assessment will evaluate your expertise across 5 key areas.</p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Enter your full name"
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
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <Button 
                onClick={handleUserDataSubmit} 
                className="w-full mt-6"
                disabled={!userData.name || !userData.email || !userData.phone}
              >
                Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Assessment Questions */}
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
                
                {answers[currentQuestion] && (
                  <Button onClick={() => handleAnswerSelect(answers[currentQuestion])}>
                    {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'results' && results && (
          <div className="space-y-8 p-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${results.color}`}>
                {results.level}
              </div>
              <p className="text-lg text-white mb-6">{results.description}</p>
              
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h4 className="font-semibold mb-4 text-card-foreground">Your Overall Score</h4>
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round((answers.reduce((sum, score) => sum + score, 0) / 100) * 100)}%
                </div>
                <p className="text-sm text-white">
                  {answers.reduce((sum, score) => sum + score, 0)} out of 100 points
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-center text-white">Your Performance by Category</h4>
              <div className="space-y-4">
                {categoryScores.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1 text-card-foreground">{cat.category}</div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-primary">{cat.percentage}%</div>
                      <div className="text-xs text-muted-foreground">{cat.score}/20</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
              <h4 className="font-semibold mb-3 flex items-center justify-center text-white">
                <Award className="w-5 h-5 mr-2" />
                Ready to Advance Your Safety 4.0 Skills?
              </h4>
              <p className="text-white mb-6">
                Join our IOSH-approved Safety 4.0 Academy and transform your career with industry-leading digital safety expertise.
              </p>
              <Button size="lg" className="mb-4">
                Enroll in Safety 4.0 Academy
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={resetAssessment}>
                Retake Assessment
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
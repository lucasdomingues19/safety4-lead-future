import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Award, TrendingUp, Zap } from "lucide-react";

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
  // Digital Technology Integration (4 questions)
  {
    id: 1,
    category: "Digital Technology Integration",
    text: "How familiar are you with IoT sensors for safety monitoring?",
    options: [
      { text: "I design and implement IoT safety systems", points: 5 },
      { text: "I regularly use IoT data for safety decisions", points: 4 },
      { text: "I understand IoT basics and have some experience", points: 3 },
      { text: "I know what IoT is but haven't used it for safety", points: 2 },
      { text: "I'm not familiar with IoT technology", points: 1 }
    ]
  },
  {
    id: 2,
    category: "Digital Technology Integration",
    text: "How do you currently manage safety data and analytics?",
    options: [
      { text: "Advanced predictive analytics with AI/ML models", points: 5 },
      { text: "Real-time dashboards with automated reporting", points: 4 },
      { text: "Digital systems with basic analytics", points: 3 },
      { text: "Spreadsheets and simple databases", points: 2 },
      { text: "Paper-based record keeping", points: 1 }
    ]
  },
  {
    id: 3,
    category: "Digital Technology Integration",
    text: "What's your experience with wearable safety technology?",
    options: [
      { text: "I lead implementation of smart PPE programs", points: 5 },
      { text: "I regularly analyze wearable safety data", points: 4 },
      { text: "I've tested or piloted wearable safety devices", points: 3 },
      { text: "I know about them but haven't used them", points: 2 },
      { text: "I'm unfamiliar with wearable safety tech", points: 1 }
    ]
  },
  {
    id: 4,
    category: "Digital Technology Integration",
    text: "How do you approach digital transformation in safety?",
    options: [
      { text: "I lead organization-wide digital safety strategies", points: 5 },
      { text: "I actively promote and implement digital solutions", points: 4 },
      { text: "I support digital initiatives when proposed", points: 3 },
      { text: "I'm cautious but open to digital changes", points: 2 },
      { text: "I prefer traditional safety methods", points: 1 }
    ]
  },
  // AI and Machine Learning (4 questions)
  {
    id: 5,
    category: "AI and Machine Learning",
    text: "How do you use artificial intelligence in safety management?",
    options: [
      { text: "I develop and implement AI-powered safety solutions", points: 5 },
      { text: "I regularly use AI tools for risk assessment", points: 4 },
      { text: "I have basic experience with AI safety applications", points: 3 },
      { text: "I understand AI concepts but haven't applied them", points: 2 },
      { text: "I'm not familiar with AI in safety", points: 1 }
    ]
  },
  {
    id: 6,
    category: "AI and Machine Learning",
    text: "What's your experience with predictive safety analytics?",
    options: [
      { text: "I build predictive models to prevent incidents", points: 5 },
      { text: "I use predictive analytics for risk forecasting", points: 4 },
      { text: "I understand predictive concepts and use some tools", points: 3 },
      { text: "I know what predictive analytics is but don't use it", points: 2 },
      { text: "I rely on historical data and reactive measures", points: 1 }
    ]
  },
  {
    id: 7,
    category: "AI and Machine Learning",
    text: "How do you handle automated safety monitoring systems?",
    options: [
      { text: "I design and optimize AI-powered monitoring systems", points: 5 },
      { text: "I manage automated systems with AI components", points: 4 },
      { text: "I work with basic automated monitoring tools", points: 3 },
      { text: "I use simple automated alerts and notifications", points: 2 },
      { text: "I rely on manual monitoring and inspections", points: 1 }
    ]
  },
  {
    id: 8,
    category: "AI and Machine Learning",
    text: "What's your approach to machine learning for incident analysis?",
    options: [
      { text: "I use ML to identify patterns and prevent incidents", points: 5 },
      { text: "I apply ML tools for root cause analysis", points: 4 },
      { text: "I understand ML basics and use simple algorithms", points: 3 },
      { text: "I know about ML but use traditional analysis methods", points: 2 },
      { text: "I'm not familiar with machine learning", points: 1 }
    ]
  },
  // Data Analytics and Visualization (4 questions)
  {
    id: 9,
    category: "Data Analytics and Visualization",
    text: "How sophisticated are your safety data visualization capabilities?",
    options: [
      { text: "I create interactive dashboards with advanced analytics", points: 5 },
      { text: "I build comprehensive safety dashboards regularly", points: 4 },
      { text: "I use standard charts and basic visualization tools", points: 3 },
      { text: "I create simple graphs and reports occasionally", points: 2 },
      { text: "I primarily use text-based reports", points: 1 }
    ]
  },
  {
    id: 10,
    category: "Data Analytics and Visualization",
    text: "What's your experience with real-time safety monitoring?",
    options: [
      { text: "I manage real-time systems with instant alerts and responses", points: 5 },
      { text: "I use real-time dashboards for safety oversight", points: 4 },
      { text: "I have some real-time monitoring capabilities", points: 3 },
      { text: "I check systems regularly but not in real-time", points: 2 },
      { text: "I rely on periodic reports and manual checks", points: 1 }
    ]
  },
  {
    id: 11,
    category: "Data Analytics and Visualization",
    text: "How do you analyze safety performance trends?",
    options: [
      { text: "I use advanced statistical modeling and trend analysis", points: 5 },
      { text: "I perform detailed trend analysis with multiple data sources", points: 4 },
      { text: "I track basic trends and compare periods", points: 3 },
      { text: "I look at simple metrics and basic comparisons", points: 2 },
      { text: "I focus on current data without trend analysis", points: 1 }
    ]
  },
  {
    id: 12,
    category: "Data Analytics and Visualization",
    text: "What's your approach to safety data integration?",
    options: [
      { text: "I integrate multiple systems into comprehensive analytics platforms", points: 5 },
      { text: "I combine data from several safety systems regularly", points: 4 },
      { text: "I work with data from a few integrated systems", points: 3 },
      { text: "I mainly use data from individual systems separately", points: 2 },
      { text: "I work with isolated data sources", points: 1 }
    ]
  },
  // Digital Leadership and Change Management (4 questions)
  {
    id: 13,
    category: "Digital Leadership and Change Management",
    text: "How do you lead digital transformation in safety culture?",
    options: [
      { text: "I champion and drive organization-wide digital safety culture", points: 5 },
      { text: "I actively promote digital adoption across teams", points: 4 },
      { text: "I support digital initiatives and encourage adoption", points: 3 },
      { text: "I adapt to digital changes when required", points: 2 },
      { text: "I prefer traditional approaches and resist change", points: 1 }
    ]
  },
  {
    id: 14,
    category: "Digital Leadership and Change Management",
    text: "What's your experience with training teams on new safety technologies?",
    options: [
      { text: "I design and deliver comprehensive digital training programs", points: 5 },
      { text: "I regularly train teams on new safety technologies", points: 4 },
      { text: "I provide basic training on technology adoption", points: 3 },
      { text: "I occasionally help colleagues with new tools", points: 2 },
      { text: "I focus on learning new technologies myself", points: 1 }
    ]
  },
  {
    id: 15,
    category: "Digital Leadership and Change Management",
    text: "How do you manage resistance to digital safety initiatives?",
    options: [
      { text: "I expertly navigate and overcome organizational resistance", points: 5 },
      { text: "I have strategies to address resistance effectively", points: 4 },
      { text: "I work to convince skeptics with moderate success", points: 3 },
      { text: "I struggle with resistance but try to address it", points: 2 },
      { text: "I avoid confronting resistance to change", points: 1 }
    ]
  },
  {
    id: 16,
    category: "Digital Leadership and Change Management",
    text: "What's your role in strategic safety technology decisions?",
    options: [
      { text: "I lead strategic technology planning and vendor selection", points: 5 },
      { text: "I significantly influence technology strategy decisions", points: 4 },
      { text: "I provide input on technology choices", points: 3 },
      { text: "I implement decisions made by others", points: 2 },
      { text: "I have minimal input on technology strategy", points: 1 }
    ]
  },
  // Industry 4.0 Compliance and Standards (4 questions)
  {
    id: 17,
    category: "Industry 4.0 Compliance and Standards",
    text: "How familiar are you with Industry 4.0 safety standards?",
    options: [
      { text: "I help develop and implement Industry 4.0 standards", points: 5 },
      { text: "I'm well-versed in current Industry 4.0 safety standards", points: 4 },
      { text: "I have good knowledge of relevant standards", points: 3 },
      { text: "I know basic Industry 4.0 concepts", points: 2 },
      { text: "I'm unfamiliar with Industry 4.0 standards", points: 1 }
    ]
  },
  {
    id: 18,
    category: "Industry 4.0 Compliance and Standards",
    text: "What's your experience with cyber-security in safety systems?",
    options: [
      { text: "I design and implement cyber-secure safety systems", points: 5 },
      { text: "I actively manage cyber-security for safety systems", points: 4 },
      { text: "I understand cyber-security basics for safety", points: 3 },
      { text: "I'm aware of cyber-security but don't manage it", points: 2 },
      { text: "I haven't considered cyber-security for safety systems", points: 1 }
    ]
  },
  {
    id: 19,
    category: "Industry 4.0 Compliance and Standards",
    text: "How do you approach regulatory compliance in digital safety?",
    options: [
      { text: "I lead compliance strategies for emerging digital regulations", points: 5 },
      { text: "I ensure compliance with current digital safety regulations", points: 4 },
      { text: "I work to maintain compliance with standard regulations", points: 3 },
      { text: "I follow established compliance procedures", points: 2 },
      { text: "I'm uncertain about digital safety compliance requirements", points: 1 }
    ]
  },
  {
    id: 20,
    category: "Industry 4.0 Compliance and Standards",
    text: "What's your experience with international safety 4.0 frameworks?",
    options: [
      { text: "I contribute to international Safety 4.0 framework development", points: 5 },
      { text: "I implement international Safety 4.0 frameworks", points: 4 },
      { text: "I'm familiar with major international frameworks", points: 3 },
      { text: "I know some international standards exist", points: 2 },
      { text: "I focus mainly on local/national standards", points: 1 }
    ]
  }
];

export const Safety4AssessmentModal = ({ isOpen, onClose }: AssessmentModalProps) => {
  const [step, setStep] = useState<'capture' | 'assessment' | 'results'>('capture');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', phone: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleUserDataSubmit = () => {
    if (userData.name && userData.email && userData.phone) {
      setStep('assessment');
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
    const categories = ['Digital Technology Integration', 'AI and Machine Learning', 'Data Analytics and Visualization', 'Digital Leadership and Change Management', 'Industry 4.0 Compliance and Standards'];
    
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
              <h3 className="text-xl font-semibold mb-4">Discover Your Safety 4.0 Readiness Level</h3>
              <p className="text-gray-600 mb-6">Get your personalized assessment and unlock your path to becoming a Safety 4.0 leader. This comprehensive 20-question assessment will evaluate your expertise across 5 key areas.</p>
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
                <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-sm font-medium">{questions[currentQuestion].category}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">{questions[currentQuestion].text}</h3>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option.points)}
                    className={`w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                      answers[currentQuestion] === option.points ? 'border-primary bg-primary/5' : 'border-gray-200'
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
              <p className="text-lg text-gray-600 mb-6">{results.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="font-semibold mb-4">Your Overall Score</h4>
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round((answers.reduce((sum, score) => sum + score, 0) / 100) * 100)}%
                </div>
                <p className="text-sm text-gray-600">
                  {answers.reduce((sum, score) => sum + score, 0)} out of 100 points
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-center">Your Performance by Category</h4>
              <div className="space-y-4">
                {categoryScores.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{cat.category}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-primary">{cat.percentage}%</div>
                      <div className="text-xs text-gray-500">{cat.score}/20</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
              <h4 className="font-semibold mb-3 flex items-center justify-center">
                <Award className="w-5 h-5 mr-2" />
                Ready to Advance Your Safety 4.0 Skills?
              </h4>
              <p className="text-gray-600 mb-6">
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
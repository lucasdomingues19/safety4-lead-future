import { ArrowLeft, Download, CheckCircle, FileText, Mail, Award, Building2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import certificateSample from "@/assets/certificate-sample.png";
import imperialLogo from "@/assets/imperial-logo.png";
import lbsLogo from "@/assets/lbs-logo.png";
import kingsLogo from "@/assets/kings-logo.png";
import ufrjLogo from "@/assets/ufrj-logo.png";
import uffLogo from "@/assets/uff-logo.png";
import seadrillLogo from "@/assets/seadrill-logo.png";
import sevanDrillingLogo from "@/assets/sevan-drilling-logo.png";
import zenobeLogo from "@/assets/zenobe-logo.png";
import shield360Logo from "@/assets/shield360-logo.png";
import andradeGutierrezLogo from "@/assets/andrade-gutierrez-logo.jpeg";

const Expense = () => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const emailTemplate = `Hi [Manager's Name],

I'd like to register for the IOSH Approved Safety 4.0 - Leading Safety in the Digital Age in [month], as I believe it will positively impact my work at [your company] and strengthen our safety culture and performance.

This comprehensive training focuses on digital transformation in safety management, covering Industry 4.0 technologies, artificial intelligence, data-driven safety leadership, and modern risk management approaches. It is CPD certified and IOSH approved, which means it meets professional development requirements and is recognised by leading industry bodies.

The program has been attended by safety leaders from safety leaders ahe feedback has been excellent, so I believe that upskilling through this course will contribute to my professional growth. I will dedicate approximately [x] hours per to complete the program, including live sessions, practical exercises, and studying recommended materials.

Key Benefits for Our Company:
• Reduced incident rates through data-driven safety approaches
• Enhanced compliance with modern safety regulations and standards
• Implementation of predictive safety analytics and IoT monitoring
• Leadership skills to drive safety culture transformation
• ROI through proactive risk management and prevention

The training covers:
• Safety 4.0 fundamentals and digital transformation in safety
• IoT, AI, and predictive analytics for safety management
• Data-driven decision making and KPI optimization
• Leadership strategies for safety culture change
• Regulatory compliance and modern safety standards
• Practical case studies from leading global organizations

The program fee is [price], and includes:
✓ Complete Safety 4.0 curriculum
✓ Certificate of Completion (CPD certified & IOSH approved)
✓ Access to exclusive safety resources and templates
✓ Networking with global safety leaders
✓ [Any additional benefits]

Therefore, I'd like to request approval to submit the training fee as a reimbursable professional development expense.

Thank you for your consideration,
[Your Name]`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailTemplate);
    toast.success("Email template copied to clipboard!");
  };

  const handleDownloadEmail = () => {
    const blob = new Blob([emailTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'safety-4-0-training-reimbursement-email.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Email template downloaded!");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements - Purple and Lime */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Top right */}
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom left */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Bottom right */}
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Back Navigation */}
        <div className="mb-12">
          <Button variant="outline" size="sm" asChild className="border-white/30 text-white hover:bg-white/10">
            <a href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Expense Our Training Through <span className="text-pink-500">Your Company</span>
          </h1>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-white">Employees:</strong> Many professionals are required to maintain a CPD record and update it regularly in order to meet the requirements of the professional bodies within their industry. Our training program is CPD certified and IOSH approved. It means that this training is just as valuable to your company as it is to you. Your company may offer professional development or education budgets that cover the cost of our training. See the resources below to help you get reimbursed.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-white">Independent Professionals</strong> and <strong className="text-white">Business Owners:</strong> Many participants have been able to deduct the cost of work-related training as a business expense. Consult with your accountant, and{" "}
              <a href="/contact" className="text-pink-500 hover:text-pink-400 underline">
                let us know
              </a>{" "}
              if you need any additional documentation.
            </p>
          </div>
        </div>

        {/* Resources Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-4">
              Resources to Get Reimbursed
            </h2>
          </div>

          <div className="space-y-8">
            {/* Email Template */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-8 h-8 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Email Template</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      If you need manager approval, use our email template, customizing it as necessary. Let your manager know you're interested in a training that will improve your work, and frame it in terms of how it will benefit your company.
                    </p>
                    <Button 
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                      onClick={() => setIsEmailModalOpen(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      View Email Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice / Receipt */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-lime-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-lime-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Invoice / Receipt</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Upon registering for our training, you will receive an automated invoice, which you can forward to your company for reimbursement. If you require a tax invoice with additional custom information, such as your company name, address, or VAT number, please{" "}
                      <a href="/contact" className="text-pink-500 hover:text-pink-400 underline">
                        contact us
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Certificate */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Training Certificate</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Once you complete the training program, we will email you the certificate that proves you completed the course.
                    </p>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-w-md mx-auto">
                      <img
                        src={certificateSample}
                        alt="Example Certificate of Completion"
                        className="w-full rounded-lg"
                      />
                      <p className="text-sm text-gray-400 mt-3 text-center">Example of Certificate of Completion</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Group Purchases CTA */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-lime-500/20 to-pink-500/20 border-lime-500/30">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-lime-400" />
              </div>
              <h2 className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-4">
                Group Purchases & In-Company Training
              </h2>
              <h3 className="text-3xl font-bold text-white mb-6">
                Training Your Entire Team?
              </h3>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Interested in registering your team for our training at a group discount or hosting this program privately at your organization?
              </p>
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us for Pricing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Email Template Modal */}
        <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Email Template for Manager Approval</DialogTitle>
              <DialogDescription className="text-lime-400">
                Customize this template as needed to request reimbursement for the Safety 4.0 training program.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6">
              <div className="bg-muted/50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-white">{emailTemplate}</pre>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleCopyEmail}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button 
                  onClick={handleDownloadEmail}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as .txt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Expense;

import { ArrowLeft, Download, CheckCircle, FileText, Mail, Award, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11113a] via-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-20">
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
              <strong className="text-white">Employees:</strong> Our training program is just as valuable to your company as it is to you. Many organizations offer professional development or education budgets that cover the cost of our training. See the resources below to help you get reimbursed.
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
                    <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download Email Template
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
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
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
      </div>
    </div>
  );
};

export default Expense;

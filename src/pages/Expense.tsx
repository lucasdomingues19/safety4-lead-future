import { ArrowLeft, Download, CheckCircle, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Company <span className="text-pink-500">Reimbursement</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Get your Safety 4.0 training reimbursed by your employer
          </p>
        </div>

        {/* Content will be added soon */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Reimbursement Resources</h2>
            <p className="text-gray-300 mb-8">
              Content coming soon. This page will provide templates and resources to help you request 
              training reimbursement from your company.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Request Template</h3>
                  <p className="text-gray-300 text-sm">Download our proven email template</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-lime-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">ROI Calculator</h3>
                  <p className="text-gray-300 text-sm">Demonstrate value to your employer</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Program Overview</h3>
                  <p className="text-gray-300 text-sm">Detailed course information for HR</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Success Stories</h3>
                  <p className="text-gray-300 text-sm">How others got approved</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg">
              Contact Us for Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expense;

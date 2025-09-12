import { ArrowLeft, Users, TrendingUp, Award, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const Affiliates = () => {
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
            <span className="text-pink-500">Affiliate</span> Program
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Partner with us to transform safety careers worldwide while building a rewarding income stream
          </p>
        </div>

        {/* Program Overview */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">Join Our Mission</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-4">
                  Become part of the Safety 4.0 revolution by promoting the world's most advanced safety 
                  leadership program. Our affiliate program offers generous commissions, marketing support, 
                  and the opportunity to make a real difference in workplace safety.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Whether you're a safety professional, trainer, consultant, or industry influencer, 
                  our program provides everything you need to succeed while helping others advance their careers.
                </p>
              </div>

              <Button className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6">
                Apply Now
              </Button>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-lime-400" />
                </div>
                <div className="text-2xl font-bold text-lime-400 mb-2">25-35%</div>
                <div className="text-sm text-gray-400">Commission Rate</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-pink-400 mb-2">24/7</div>
                <div className="text-sm text-gray-400">Support Team</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">98%</div>
                <div className="text-sm text-gray-400">Satisfaction Rate</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-2">IOSH</div>
                <div className="text-sm text-gray-400">Approved</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Apply & Get Approved</h3>
                <p className="text-gray-300">Submit your application with your background in safety, training, or marketing. We review within 48 hours.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Access Marketing Materials</h3>
                <p className="text-gray-300">Get your unique referral links, banners, email templates, and promotional content from our resource library.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Promote & Earn</h3>
                <p className="text-gray-300">Share Safety 4.0 Academy with your network and earn 25-35% commission on every successful enrollment.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Track & Get Paid</h3>
                <p className="text-gray-300">Monitor your referrals in real-time through our dashboard. Commissions paid monthly via your preferred method.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Commission Structure</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-3xl font-bold text-lime-400 mb-4">25%</div>
              <h3 className="text-xl font-semibold text-white mb-4">Bronze Level</h3>
              <p className="text-gray-300 mb-4">1-5 referrals per month</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Marketing materials</li>
                <li>• Monthly payments</li>
                <li>• Email support</li>
              </ul>
            </div>

            <div className="bg-gradient-to-b from-pink-500/20 to-pink-500/10 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 text-center">
              <div className="text-3xl font-bold text-pink-400 mb-4">30%</div>
              <h3 className="text-xl font-semibold text-white mb-4">Silver Level</h3>
              <p className="text-gray-300 mb-4">6-15 referrals per month</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Everything in Bronze</li>
                <li>• Priority support</li>
                <li>• Custom materials</li>
                <li>• Quarterly bonuses</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-4">35%</div>
              <h3 className="text-xl font-semibold text-white mb-4">Gold Level</h3>
              <p className="text-gray-300 mb-4">16+ referrals per month</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Everything in Silver</li>
                <li>• Dedicated manager</li>
                <li>• Co-marketing opportunities</li>
                <li>• Annual bonuses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500/20 to-lime-500/20 rounded-3xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Earning?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Join hundreds of affiliates already earning substantial commissions while promoting 
              the future of safety education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6">
                Apply Now
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                Download Info Pack
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliates;
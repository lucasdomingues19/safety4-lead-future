import { ArrowLeft, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating purple elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 via-purple-600/25 to-violet-500/20 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/25 via-violet-500/30 to-purple-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/20 via-purple-500/25 to-purple-400/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/15 via-violet-500/20 to-purple-600/10 blur-2xl animate-[pulse_15s_ease-in-out_infinite]"></div>
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
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Get in <span className="text-pink-500">Touch</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Ready to transform your safety career? We're here to help you begin your Safety 4.0 journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Send us a Message</h2>
                <p className="text-gray-300 mb-8">
                  Have questions about our program? Need help choosing the right path for your career? 
                  Our team is ready to provide personalized guidance.
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">First Name</label>
                    <Input 
                      type="text" 
                      placeholder="Enter your first name"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Last Name</label>
                    <Input 
                      type="text" 
                      placeholder="Enter your last name"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email address"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone Number (Optional)</label>
                  <Input 
                    type="tel" 
                    placeholder="Enter your phone number"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Current Role</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., Safety Manager, HSE Officer"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Inquiry Type</label>
                  <select 
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                    defaultValue=""
                  >
                    <option value="" disabled>Select inquiry type</option>
                    <option value="general">General Inquiry</option>
                    <option value="discount">Request Individual Discount</option>
                    <option value="group">Group Training</option>
                    <option value="reimbursement">Reimbursement Help</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message</label>
                  <Textarea 
                    placeholder="Tell us about your safety career goals and how we can help..."
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                  />
                </div>

                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Contact Information</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-300">info@safety4academy.com</p>
                    <p className="text-gray-300">admissions@safety4academy.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-lime-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Phone</h3>
                    <p className="text-gray-300">+44 (0) 20 7XXX XXXX</p>
                    <p className="text-gray-300">+1 (555) XXX-XXXX</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Address</h3>
                    <p className="text-gray-300">Safety 4.0 Academy Headquarters</p>
                    <p className="text-gray-300">London, United Kingdom</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Office Hours</h3>
                    <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM GMT</p>
                    <p className="text-gray-300">Weekend: Emergency support available</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-lime-500/50 text-lime-400 hover:bg-lime-500/10">
                    Download Program Brochure
                  </Button>
                  <Button variant="outline" className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
                    Schedule a Call
                  </Button>
                  <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    Join Our Webinar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
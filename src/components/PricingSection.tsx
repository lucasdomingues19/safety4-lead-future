import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Building, Tablet, ArrowRight } from "lucide-react";
import { CohortPreEnrollModal } from "./CohortPreEnrollModal";


export const PricingSection = () => {
  const [showCohortModal, setShowCohortModal] = useState(false);
  
  const pricingTiers = [
    {
      name: "eLearning",
      price: "£597",
      originalPrice: "£697",
      period: "one-time",
      description: "Self-paced online learning with 12-month access",
      icon: Tablet,
      features: [
        "IOSH & CPD certification",
        "10 core modules",
        "2 masterclasses [bonus]",
        "50+ video lessons",
        "Downloadable resources",
        "Interactive assessments",
        "Case studies",
        "12-month access to materials",
        "Email support",
        "Mobile app",
      ],
      cta: "Start Learning",
      popular: false,
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Safety 4.0 Accelerator Cohort",
      price: "£997",
      originalPrice: "£1,497",
      period: "per person",
      description: "Live group + elearning training with expert guidance and peer interaction",
      icon: Users,
      features: [
        "Everything in eLearning",
        "4-week live cohort program",
        "Weekly live sessions with instructor",
        "Peer networking opportunities",
        "Group projects & discussions",
        "Live Q&A sessions",
        "Career coaching sessions",
        "Priority support",
        "Exclusive community membership",
      ],
      cta: "Apply Now",
      popular: true,
      gradient: "from-pink-500/20 to-purple-500/20",
      borderColor: "border-pink-500/50",
      buttonColor: "bg-pink-500 hover:bg-pink-600",
    },
    {
      name: "In-Company",
      price: "Custom",
      period: "pricing",
      description: "Tailored training solution for your organization",
      icon: Building,
      features: [
        "Customized curriculum",
        "On-site or virtual delivery",
        "Multiple employee access",
        "Company-specific case studies",
        "Leadership training modules",
        "Progress tracking dashboard",
        "Dedicated account manager",
        "Post-training support",
        "Bulk certification discounts",
      ],
      cta: "Get Quote",
      popular: false,
      gradient: "from-lime-500/20 to-green-500/20",
      borderColor: "border-lime-500/30",
      buttonColor: "bg-lime-500 hover:bg-lime-600 text-black",
    },
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 px-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Choose Your <span className="text-pink-500">Learning Path</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Flexible training options designed to fit your schedule and learning preferences
          </p>
          <p className="text-sm md:text-base text-gray-400 max-w-3xl mx-auto mt-4 leading-relaxed">
            *Get <a href="/expense" className="text-pink-500 hover:text-pink-400 underline">reimbursed</a> by your company, request an <a href="/contact?request=discount" className="text-pink-500 hover:text-pink-400 underline">individual</a> discount, or unlock a reduced price for a <a href="#" className="text-pink-500 hover:text-pink-400 underline">group</a> (3+ seats)
          </p>
        </div>


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border ${tier.borderColor} ${
                tier.popular ? "md:scale-105 lg:scale-110" : ""
              } transition-all duration-300 hover:scale-[1.02] md:hover:scale-105`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${tier.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <tier.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center space-x-2">
                  {tier.originalPrice ? (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400 text-lg line-through mb-1">{tier.originalPrice}</span>
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                  )}
                  <span className="text-gray-400 text-lg">{tier.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {tier.name === "Safety 4.0 Accelerator Cohort" ? (
                <a href="https://tally.so/r/ZjNNl5" target="_blank" rel="noopener noreferrer">
                  <Button 
                    className={`w-full ${tier.buttonColor} text-white font-semibold py-6 text-lg group`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              ) : (
                <a 
                  href={
                    tier.name === "eLearning" 
                      ? "https://safetyacademy.mykajabi.com/offers/E2ZXsoXV"
                      : tier.name === "In-Company" 
                      ? "/contact" 
                      : undefined
                  }
                  target={tier.name === "eLearning" ? "_blank" : undefined}
                  rel={tier.name === "eLearning" ? "noopener noreferrer" : undefined}
                >
                  <Button className={`w-full ${tier.buttonColor} text-white font-semibold py-6 text-lg group`}>
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Not sure which option is right for you?
            </h3>
            <p className="text-gray-300 mb-6">
              Schedule a free consultation with our team to find the perfect training solution for your needs.
            </p>
            <a href="https://calendly.com/lucas-getshield360/30min" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
                Schedule Free Consultation
              </Button>
            </a>
          </div>
        </div>

        {/* Cohort Pre-Enrollment Modal */}
        <CohortPreEnrollModal open={showCohortModal} onOpenChange={setShowCohortModal} />
      </div>
    </section>
  );
};
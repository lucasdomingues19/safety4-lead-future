import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Building, Tablet, ArrowRight } from "lucide-react";
import { CohortPreEnrollModal } from "./CohortPreEnrollModal";


export const PricingSection = () => {
  const [showCohortModal, setShowCohortModal] = useState(false);

  const pricingTiers = [
  {
    name: "AI Fundamentals in EHS",
    price: "£97",
    period: "",
    description: "A fast-track introduction to AI for EHS professionals",
    icon: Building,
    features: [
    "90-minute eLearning course",
    "Develop basic digital literacy and skills",
    "Understand AI in EHS",
    "Build confidence to navigate the AI transition",
    "Recognise AI risks and governance requirements",
    "Be ready to go deeper in Safety 4.0"],

    cta: "Start Learning",
    popular: false,
    gradient: "from-primary to-secondary",
    borderColor: "border-slate-200 hover:border-primary/40",
    buttonColor: "bg-primary hover:bg-primary/90"
  },
  {
    name: "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age",
    price: "£497",
    originalPrice: "£697",
    period: "one-time",
    description: "Self-paced online learning",
    icon: Tablet,
    features: [
    "IOSH & CPD certification",
    "10 core modules",

    "60+ video lessons",
    "Downloadable resources",
    "Interactive assessments",
    "Case studies",
    "90-day access to complete course",
    "Email support",
    "Mobile app"],

    cta: "Start Learning",
    popular: true,
    gradient: "from-primary to-secondary",
    borderColor: "border-2 border-[#c4ff00] hover:border-[#c4ff00] shadow-lg shadow-[#c4ff00]/20",
    buttonColor: "bg-primary hover:bg-primary/90"
  },
  {
    name: "Safety 4.0 Accelerator\u00A0 Cohort",
    price: "£1,997",
    originalPrice: "£2,497",
    period: "per person",
    description: "Live group + elearning training with expert guidance and peer interaction",
    icon: Users,
    features: [
    "Everything in eLearning",
    "6-week live cohort program",
    "Expert-led live sessions with global faculty members",
    "Peer networking opportunities",
    "Group projects & discussions",
    "Live Q&A sessions",

    "Priority support",
    "Exclusive community membership"],

    cta: "Apply Now",
    popular: false,
    gradient: "from-primary to-secondary",
    borderColor: "border-slate-200 hover:border-primary/40",
    buttonColor: "bg-primary hover:bg-primary/90"
  }];


  return (
    <section id="pricing" className="py-32 md:py-40 relative overflow-hidden">

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20 px-2">
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-primary bg-primary/10 inline-block px-4 py-2 rounded-lg mb-6">
            Transparent Pricing
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 md:mb-8 tracking-tight leading-[1.08]">
            Investment in Your Team's Future
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
            Choose the right programme for your organization. Most teams start with a cohort rollout for stronger engagement and peer learning.
          </p>
        </div>


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 w-full items-stretch mb-20">
          {pricingTiers.map((tier, index) =>
          <div
            key={index}
            id={tier.name === "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age" ? "elearning" : undefined}
            className={`relative bg-white backdrop-blur-sm rounded-3xl p-6 md:p-8 border shadow-md hover:shadow-xl ${tier.borderColor} ${
            tier.popular ? "lg:scale-105" : ""} transition-all duration-300 hover:-translate-y-1 flex flex-col`
            }>
            
              {/* Popular Badge */}
              {tier.popular &&
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#c4ff00] text-slate-900 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md">
                    Most Popular
                  </div>
                </div>
            }

              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${tier.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <tier.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{tier.description}</p>
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center space-x-2">
                    {tier.originalPrice ?
                      <>
                        <span className="text-slate-500 text-lg line-through">{tier.originalPrice}</span>
                        <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                      </> :
                      <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                    }
                    <span className="text-slate-500 text-lg">{tier.period}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, featureIndex) =>
              <div key={featureIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </div>
              )}
              </div>

              {/* CTA Button */}
              {tier.name === "AI Fundamentals in EHS" ?
            <a href="https://learning.safetyacademy.tech/offers/osRfeBFj/checkout" target="_blank" rel="noopener noreferrer">
                  <Button
                className={`w-full ${tier.buttonColor} text-primary-foreground font-semibold py-6 text-lg group`}>
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a> :
            tier.name === "Safety 4.0 Accelerator\u00A0 Cohort" ?
            <a href="/accelerator">
                  <Button
                className={`w-full ${tier.buttonColor} text-primary-foreground font-semibold py-6 text-lg group`}>
                
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a> :

            <a
              href={
              tier.name === "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age" ?
              "https://safetyacademy.mykajabi.com/offers/E2ZXsoXV" :
              undefined
              }
              target={tier.name === "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age" ? "_blank" : undefined}
              rel={tier.name === "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age" ? "noopener noreferrer" : undefined}>
              
                  <Button className={`w-full ${tier.buttonColor} text-primary-foreground font-semibold py-6 text-lg group`}>
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
            }
            </div>
          )}
        </div>

        <p className="text-sm md:text-base text-slate-500 mx-auto mt-6 text-center leading-relaxed lg:whitespace-nowrap">
          *Get <a href="/contact?request=reimbursement" className="text-primary hover:text-primary/80 underline">reimbursed</a> by your company, request an <a href="/contact?request=discount" className="text-primary hover:text-primary/80 underline">individual</a> discount, or unlock a reduced price for a <a href="/contact?request=group" className="text-primary hover:text-primary/80 underline">group</a> (3+ seats)
        </p>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-slate-50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Not sure which option is right for your team?
            </h3>
            <p className="text-slate-600 mb-6">
              Schedule a free consultation with our experts to find the perfect training solution for your team needs.
            </p>
            <a href="https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy" target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Schedule Free Consultation
              </Button>
            </a>
          </div>
        </div>

        {/* Cohort Pre-Enrollment Modal */}
        <CohortPreEnrollModal open={showCohortModal} onOpenChange={setShowCohortModal} />
      </div>
    </section>);

};
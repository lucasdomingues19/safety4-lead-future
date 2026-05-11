import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Building, Tablet, ArrowRight } from "lucide-react";
import { CohortPreEnrollModal } from "./CohortPreEnrollModal";


export const PricingSection = () => {
  const [showCohortModal, setShowCohortModal] = useState(false);

  const pricingTiers = [
  {
    name: "eLearning",
    price: "£497",
    originalPrice: "£697",
    period: "one-time",
    description: "Self-paced certification, on your schedule.",
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

    cta: "Begin eLearning",
    popular: false,
    gradient: "from-[hsl(var(--secondary)/0.18)] to-[hsl(var(--secondary)/0.05)]",
    borderColor: "border-white/10",
    buttonColor: "bg-[hsl(var(--secondary))] hover:opacity-90"
  },
  {
    name: "Accelerator • Cohort",
    price: "£997",
    originalPrice: "£1,497",
    period: "per person",
    description: "4-week live cohort with expert mentoring and peers.",
    icon: Users,
    features: [
    "Everything in eLearning",
    "4-week live cohort program",
    "Weekly live sessions with instructor",
    "Peer networking opportunities",
    "Group projects & discussions",
    "Live Q&A sessions",
    "Priority support",
    "Exclusive community membership"],

    cta: "Apply for June Cohort",
    popular: true,
    gradient: "from-[hsl(var(--primary)/0.22)] to-[hsl(var(--primary)/0.05)]",
    borderColor: "border-[hsl(var(--primary)/0.55)]",
    buttonColor: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
  },
  {
    name: "For Companies",
    price: "Bespoke",
    period: "pricing",
    description: "Tailored programmes for safety teams at scale.",
    icon: Building,
    features: [
    "Customized curriculum",
    "On-site or virtual delivery",
    "Multiple employee access",
    "Company-specific case studies",
    "Post-training support",
    "Bulk certification discounts"],

    cta: "Talk to Our Team",
    popular: false,
    gradient: "from-white/[0.06] to-transparent",
    borderColor: "border-white/10",
    buttonColor: "bg-white/10 hover:bg-white/15 text-white border border-white/20"
  }];


  return (
    <section id="pricing" className="py-20 md:py-28 relative overflow-hidden border-t border-white/5">

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20 px-2 max-w-3xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--primary))] font-semibold mb-4">
            Programmes & Pricing
          </div>
          <h2 className="text-white mb-5">
            Choose your <em className="not-italic text-[hsl(var(--primary))]">learning path</em>.
          </h2>
          <p className="text-base md:text-lg text-white/65 max-w-2xl mx-auto leading-relaxed">
            Three structured routes — from self-paced certification to bespoke enterprise enablement — all built on the same IOSH-approved curriculum.
          </p>
        </div>


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto items-stretch">
          {pricingTiers.map((tier, index) =>
          <div
            key={index}
            id={tier.name === "eLearning" ? "elearning" : undefined}
            className={`relative bg-[hsl(var(--card)/0.6)] backdrop-blur-sm rounded-sm p-6 md:p-9 border ${tier.borderColor} ${
            tier.popular ? "lg:scale-[1.03] shadow-[0_30px_60px_-30px_hsl(220_60%_4%/0.9)]" : ""} transition-all duration-300 hover:border-[hsl(var(--primary)/0.5)] flex flex-col`
            }>
            
              {/* Popular Badge */}
              {tier.popular &&
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-1 rounded-sm text-[11px] uppercase tracking-[0.2em] font-semibold">
                    Most Popular
                  </div>
                </div>
            }

              {/* Header */}
              <div className="text-left mb-8 pb-6 border-b border-white/10">
                <div className={`w-12 h-12 bg-gradient-to-br ${tier.gradient} border border-white/10 rounded-sm flex items-center justify-center mb-5`}>
                  <tier.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">{tier.name}</h3>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">{tier.description}</p>
                <div className="flex items-baseline gap-2">
                  {tier.originalPrice &&
                    <span className="text-white/40 text-base line-through">{tier.originalPrice}</span>
                  }
                  <span className="font-serif text-4xl md:text-5xl text-white">{tier.price}</span>
                  <span className="text-white/50 text-sm">{tier.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, featureIndex) =>
              <div key={featureIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
              )}
              </div>

              {/* CTA Button */}
              {tier.name === "Accelerator • Cohort" ?
            <a href="/accelerator">
                  <Button
                className={`w-full ${tier.buttonColor} text-white font-semibold py-6 text-lg group`}>
                
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a> :

            <a
              href={
              tier.name === "eLearning" ?
              "https://safetyacademy.mykajabi.com/offers/E2ZXsoXV" :
              tier.name === "For Companies" ?
              "/in-company" :
              undefined
              }
              target={tier.name === "eLearning" ? "_blank" : undefined}
              rel={tier.name === "eLearning" ? "noopener noreferrer" : undefined}>
              
                  <Button className={`w-full ${tier.buttonColor} text-white font-semibold py-6 text-lg group`}>
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
            }
            </div>
          )}
        </div>

        <p className="text-sm md:text-base text-white/55 max-w-3xl mx-auto mt-8 text-center leading-relaxed">
          *Get <a href="/contact?request=reimbursement" className="text-[hsl(var(--primary))] hover:underline">reimbursed</a> by your company, request an <a href="/contact?request=discount" className="text-[hsl(var(--primary))] hover:underline">individual</a> discount, or unlock a reduced price for a <a href="/contact?request=group" className="text-[hsl(var(--primary))] hover:underline">group</a> (3+ seats).
        </p>

        {/* Bottom CTA — editorial */}
        <div className="text-center mt-20">
          <div className="bg-[hsl(var(--card)/0.5)] backdrop-blur-sm rounded-sm p-10 md:p-14 border border-white/10 max-w-4xl mx-auto">
            <h3 className="font-serif text-white mb-4">
              Not sure which path fits?
            </h3>
            <p className="text-white/65 mb-8 max-w-xl mx-auto">
              Book a 30-minute consultation with our team and we'll map the right route for you or your organisation.
            </p>
            <a href="https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-[hsl(var(--primary)/0.6)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] px-8 py-6 text-base rounded-sm">
                Schedule a Consultation
              </Button>
            </a>
          </div>
        </div>

        {/* Cohort Pre-Enrollment Modal */}
        <CohortPreEnrollModal open={showCohortModal} onOpenChange={setShowCohortModal} />
      </div>
    </section>);

};
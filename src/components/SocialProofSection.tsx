import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import manalAzziPhoto from "@/assets/manal-azzi-photo.jpg";

export const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Manal Azzi",
      role: "ILO Team Lead",
      content: "Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health.",
      rating: 5,
      image: manalAzziPhoto
    },
    {
      name: "Michael Rodriguez",
      role: "VP Safety, Shell",
      content: "Within 3 months of completing the program, I was promoted to VP level. The digital skills I learned made me indispensable.",
      rating: 5,
      image: "MR"
    },
    {
      name: "Dr. Amanda Foster",
      role: "Chief Safety Officer, Boeing",
      content: "This program bridges the gap between traditional safety and digital transformation perfectly. Highly recommend for any serious safety leader.",
      rating: 5,
      image: "AF"
    },
    {
      name: "Sarah Chen",
      role: "Construction Safety Manager, Bechtel",
      content: "The AI-powered safety analytics module completely transformed how we predict and prevent incidents. Our accident rate dropped 75% in the first year.",
      rating: 5,
      image: "SC"
    },
    {
      name: "James Thompson",
      role: "Oil & Gas Safety Director, ExxonMobil",
      content: "This program gave me the digital leadership skills to modernize our entire safety framework. Now I'm leading safety transformation across 3 continents.",
      rating: 5,
      image: "JT"
    },
    {
      name: "Lisa Martinez",
      role: "Manufacturing Safety Lead, General Electric",
      content: "The ROI certification opened doors I never imagined. Within 6 months, I was headhunted for a C-suite role at a Fortune 500 company.",
      rating: 5,
      image: "LM"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating purple elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 via-purple-600/25 to-violet-500/20 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Purple blob - Top right */}
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/25 via-violet-500/30 to-purple-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom center */}
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/20 via-purple-500/25 to-purple-400/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Central purple accent */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/15 via-violet-500/20 to-purple-600/10 blur-2xl animate-[pulse_15s_ease-in-out_infinite]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Testimonials */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-8">
            Trusted by <span className="text-primary">Safety Leaders</span> Worldwide
          </h2>
          
          <p className="text-xl text-muted-foreground">
            Join thousands of safety professionals who have transformed their careers with Safety 4.0 Academy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 shadow-card hover:shadow-glow transition-all duration-300 animate-slide-up border-0 bg-white"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-primary mb-4" />
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-4">
                  {typeof testimonial.image === 'string' && testimonial.image.length <= 2 ? (
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.image}
                    </div>
                  ) : (
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
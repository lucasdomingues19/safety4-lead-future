import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import manalAzziPhoto from "@/assets/manal-azzi-photo.jpg";
import arturAieloPhoto from "@/assets/artur-aielo-photo.jpeg";
import eamonnDohertyPhoto from "@/assets/eamonn-doherty-photo.jpeg";
import benCanterburyPhoto from "@/assets/ben-canterbury-photo.jpeg";

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
      name: "Artur Aielo",
      role: "HSE Manager",
      content: "The Safety 4.0 Academy transformed how I approach workplace safety. The digital tools and methodologies have made our operations significantly safer and more efficient.",
      rating: 5,
      image: arturAieloPhoto
    },
    {
      name: "Eamonn Doherty",
      role: "HSSEQ Director",
      content: "This program bridges the gap between traditional safety and digital transformation perfectly. The practical applications have revolutionized our safety management systems.",
      rating: 5,
      image: eamonnDohertyPhoto
    },
    {
      name: "Ben Canterbury",
      role: "Corporate Safety Manager",
      content: "The AI-powered safety analytics completely transformed how we predict and prevent incidents. Our accident rate dropped significantly in the first year.",
      rating: 5,
      image: benCanterburyPhoto
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
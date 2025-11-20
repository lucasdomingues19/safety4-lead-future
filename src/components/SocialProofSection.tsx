import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import shebinAbrahamPhoto from "@/assets/shebin-abraham-photo.jpeg";
import anaCoutinhoPhoto from "@/assets/ana-coutinho-photo.jpeg";
import eamonnDohertyPhoto from "@/assets/eamonn-doherty-photo.jpeg";
import benCanterburyPhoto from "@/assets/ben-canterbury-photo.jpeg";
import jacquelineCarrPhoto from "@/assets/jacqueline-carr-photo.jpeg";
import stephanieOsbornePhoto from "@/assets/stephanie-osborne-photo.jpeg";
import alexSiedschlagPhoto from "@/assets/alex-siedschlag-photo.jpeg";
import emilyHaasPhoto from "@/assets/emily-haas-photo.png";
import johannesBuchmannPhoto from "@/assets/johannes-buchmann-photo.jpeg";

export const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Shebin Abraham",
      role: "Founder",
      content: "Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health through innovative technology solutions.",
      rating: 5,
      image: shebinAbrahamPhoto
    },
    {
      name: "Ana Coutinho",
      role: "HSE Manager, LEGO Group",
      content: "To be honest, my knowledge about SafetyTech and AI in general was not very good at all. I really enjoyed the fact that it is simple to understand and designed for people who, such as myself, have very little knowledge on the subject. I also really enjoyed the practical examples as they helped me understand the applications of SafetyTech better.",
      rating: 5,
      image: anaCoutinhoPhoto
    },
    {
      name: "Eamonn Doherty",
      role: "HSSEQ Director, SAMA Construction",
      content: "This program bridges the gap between traditional safety and digital transformation perfectly. The practical applications have revolutionized our safety management systems.",
      rating: 5,
      image: eamonnDohertyPhoto
    },
    {
      name: "Ben Canterbury",
      role: "Corporate Safety Manager, OTC Technologies",
      content: "The AI-powered safety analytics completely transformed how we predict and prevent incidents. Our accident rate dropped significantly in the first year.",
      rating: 5,
      image: benCanterburyPhoto
    },
    {
      name: "Jacqueline Carr",
      role: "Global OSH Consultant, Siemens",
      content: "Safety 4.0 is a solid introductory course for anyone looking to understand how technology is shaping modern health and safety work. The content is clear, accessible, and supported by well-produced examples that make the concepts easy to follow. It's a great starting point for OHS professionals wanting to build confidence in the health and safety tech space.",
      rating: 5,
      image: jacquelineCarrPhoto
    },
    {
      name: "Stephanie Osborne",
      role: "Health & Safety Leader, National Physics Laboratory",
      content: "The certification opened doors I never imagined. The comprehensive approach to digital safety transformation has been invaluable for advancing my career.",
      rating: 5,
      image: stephanieOsbornePhoto
    },
    {
      name: "Alex Siedschlag",
      role: "Performance Coach",
      content: "The Safety 4.0 methodology has revolutionized how I coach teams on workplace safety. The digital tools provide incredible insights for performance optimization.",
      rating: 5,
      image: alexSiedschlagPhoto
    },
    {
      name: "Emily Haas",
      role: "Associate Safety Director, National Institute for Occupational Safety and Health",
      content: "This course did a great job in bridging traditional safety management and the digital future that we're already living in. I enjoyed the later modules that dove into safetytech applications with things like wearables, computer vision, mobile report and AI. The lessons presented by Lucas made it clear that integrating data from multiple sources is critical to prevent harm before it happens. This course gives you the vision and the roadmap to make it happen.",
      rating: 5,
      image: emilyHaasPhoto
    },
    {
      name: "Johannes Buchmann",
      role: "Global Health & Safety Manager, Siemens",
      content: "Safety 4.0 is a great entry-level course for EHS professionals starting their journey into Industry 4.0 and health & safety tech. It introduces AI concepts in a clear way and includes practical tips and tricks that make applying the knowledge easier.",
      rating: 5,
      image: johannesBuchmannPhoto
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
                
                <Quote className="w-8 h-8 text-lime-500 fill-lime-500 mb-4" />
                
                <p className="text-black mb-6 leading-relaxed">
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
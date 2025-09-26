import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Manal Azzi",
      role: "ILO Team Lead",
      content: "Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health.",
      rating: 5,
      image: "MA"
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
    }
  ];

  const partners = [
    { name: "IOSH", description: "Institution of Occupational Safety and Health" },
    { name: "CPD", description: "Continuing Professional Development" },
    { name: "Microsoft", description: "Technology Partner" },
    { name: "Shell", description: "Industry Partner" },
    { name: "Boeing", description: "Aviation Safety Partner" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Testimonials */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-8">
            Trusted by <span className="text-primary">Safety Leaders</span> Worldwide
          </h2>
          
          <p className="text-xl text-muted-foreground">
            Join thousands of safety professionals who have transformed their careers with Safety 4.0 Academy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 shadow-card hover:shadow-glow transition-all duration-300 animate-slide-up border-0 bg-white"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-primary mb-4" />
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center animate-fade-in">
          <h3 className="text-2xl font-bold text-secondary mb-8">
            Recognized & Trusted By
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {partners.map((partner, index) => (
              <div 
                key={index}
                className="text-center hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-24 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-secondary font-bold text-lg">{partner.name}</span>
                </div>
                <p className="text-xs text-muted-foreground max-w-24 leading-tight">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
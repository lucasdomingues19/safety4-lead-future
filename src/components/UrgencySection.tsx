import { Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const UrgencySection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-black"></div>
      
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
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <Clock className="w-20 h-20 text-destructive" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-8">
            Safety 4.0 is <span className="text-destructive">Already Here</span>
            <br />
            Don't Get Left Behind.
          </h2>
          
          <p className="text-xl text-white mb-12 leading-relaxed">
            AI skills in EHS functions remain relatively low, with 25% of practitioners having no AI skills or experience and 61% identifying as beginners. However, 77% of recruiter place some level of importance on tech skills when recruiting
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 border-2 border-destructive/20 shadow-card animate-slide-up">
              <CardContent className="p-0 text-center">
                <div className="text-4xl font-bold text-destructive mb-4">72%</div>
                <p className="text-lg font-semibold text-secondary mb-2">
                  of companies plan to adopt AI safety solutions
                </p>
                <p className="text-muted-foreground text-sm">
                  within the next 18 months
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 border-2 border-primary/20 shadow-card animate-slide-up" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-0 text-center">
                <div className="text-4xl font-bold text-primary mb-4">150%</div>
                <p className="text-lg font-semibold text-secondary mb-2">
                  average salary increase for digital safety leaders
                </p>
                <p className="text-muted-foreground text-sm">
                  compared to traditional roles
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8">
              The question isn't whether you should upskill — it's whether you'll do it before or after your competition.
            </p>
            
            <Button variant="hero" size="lg" className="mx-auto">
              Secure Your Spot Today
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Limited spots available • Next cohort starts in 2 weeks
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
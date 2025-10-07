import { Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const UrgencySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
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
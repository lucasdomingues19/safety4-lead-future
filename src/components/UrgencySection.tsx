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
          
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            While you're reading this, forward-thinking safety leaders are already implementing 
            AI-driven safety solutions and advancing their careers at unprecedented rates.
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

          {/* Risk Reversal */}
          <div className="bg-gradient-hero rounded-2xl p-8 mb-12 animate-slide-up">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold text-secondary mb-6">
              IOSH-approved, CPD-certified. Upskill with Zero Risk.
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-secondary">100% Money-Back Guarantee</p>
                  <p className="text-sm text-muted-foreground">30-day full refund policy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-secondary">Lifetime Access</p>
                  <p className="text-sm text-muted-foreground">All updates & new content included</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-secondary">Career Support</p>
                  <p className="text-sm text-muted-foreground">Job placement assistance included</p>
                </div>
              </div>
            </div>
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
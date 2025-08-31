import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

export const ProblemSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-8">
            Traditional Safety Certificates{" "}
            <span className="text-destructive">Aren't Enough Anymore</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            The safety industry is rapidly evolving. While others struggle with outdated approaches, 
            forward-thinking safety leaders are mastering digital transformation to stay relevant and valuable.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-4 animate-slide-up">
              <TrendingDown className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Falling Behind</h3>
              <p className="text-muted-foreground">
                Traditional safety professionals are being outpaced by tech-savvy leaders
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Clock className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Limited Career Growth</h3>
              <p className="text-muted-foreground">
                Without digital skills, career advancement opportunities become scarce
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Obsolete Methods</h3>
              <p className="text-muted-foreground">
                Old-school safety management can't compete with AI-driven approaches
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
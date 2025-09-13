import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const MentorSection = () => {
  // Placeholder logos for institutions and companies
  const logos = [
    { name: "Institution 1", placeholder: "INST 1" },
    { name: "Institution 2", placeholder: "INST 2" },
    { name: "Company 1", placeholder: "COMP 1" },
    { name: "Company 2", placeholder: "COMP 2" },
    { name: "Company 3", placeholder: "COMP 3" },
    { name: "Institution 3", placeholder: "INST 3" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet Your <span className="text-primary">Mentor</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn from an industry expert with years of experience in safety leadership and digital transformation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Photo */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-8 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-lg font-medium">Lucas Domingues Photo</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Lucas Domingues</h3>
              <p className="text-xl text-primary font-medium mb-4">MSc, IOSH</p>
            </div>

            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Lucas brings over 15 years of experience in occupational health and safety, 
                specializing in digital transformation and modern safety leadership practices.
              </p>
              
              <p>
                With his Master's degree and IOSH certification, Lucas has helped hundreds 
                of safety professionals transition from traditional methods to cutting-edge, 
                data-driven approaches that drive real business value.
              </p>

              <p>
                His expertise spans across multiple industries, from manufacturing to construction, 
                where he's consistently delivered measurable improvements in safety performance 
                and organizational culture.
              </p>
            </div>

            <div className="pt-4">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Safety Leadership
                </span>
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Digital Transformation
                </span>
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Risk Management
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel for logos */}
        <div className="relative">
          <h4 className="text-2xl font-semibold text-center mb-8 text-foreground">
            Education & Experience
          </h4>
          
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {logos.map((logo, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
                  <div className="p-1">
                    <div className="aspect-video bg-card border border-border rounded-lg flex items-center justify-center hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <span className="text-muted-foreground font-bold text-xs">
                            {logo.placeholder}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{logo.name}</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
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
import manalAzziPhoto from "@/assets/manal-azzi-photo.jpg";
import rosieRussellPhoto from "@/assets/rosie-russell-photo.jpeg";
import julianaBleyPhoto from "@/assets/juliana-bley-photo.jpeg";
import jenniferMcnellyPhoto from "@/assets/jennifer-mcnelly-photo.jpeg";
import stuartHughesPhoto from "@/assets/stuart-hughes-photo.jpg";
import annaLopezPhoto from "@/assets/testimonial-anna-lopez.jpg";

export const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Shebin Abraham",
      role: "Founder",
      content: "As an HSE leader, I found the content highly relevant to the current needs of the industry. The online training provided clear insights into modern HSE strategies and the latest safety technologies that organizations must start integrating. It was to the point, forward-thinking, and aligned with the real challenges HSE leaders face today. This program is an excellent opportunity for anyone looking to upgrade their knowledge, improve their implementation approach, and stay updated with the latest advancements in safety.",
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
      role: "Health & Safety Leader",
      content: "I've just completed Safety 4.0 - Leading Safety in the Digital Age. The course was relevant, easy to digest and thought provoking. It is aimed at organisations at all stages on their digital transformation journey so has something to offer, whatever the current progress in this area. Particularly like that it is IOSH Approved too.",
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
        {/* Section Title */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 md:mb-8">
            Trusted by <span className="text-primary">Safety Leaders</span> Worldwide
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground px-2">
            Join global safety professionals who boosted their careers impact with the Safety 4.0 Academy
          </p>
        </div>

        {/* What Global Safety Leaders Are Saying - Scrolling Banner */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-8 mb-8 md:mb-16 border border-white/10 overflow-hidden">
          <h3 className="text-center text-white text-lg md:text-xl font-semibold mb-4 md:mb-8">What Global Safety Leaders Are Saying</h3>
          <div className="relative">
            <div className="flex animate-[scroll_20s_linear_infinite] space-x-4 md:space-x-8">
              {/* Testimonial 1 */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={manalAzziPhoto} alt="Manal Azzi" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health."</p>
                <div className="text-white text-xs font-medium">Manal Azzi, ILO Team Lead</div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={rosieRussellPhoto} alt="Rosie Russell" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"We need to make AI mainstream in our conversations, but we must also make sure people truly understand it before relying on it."</p>
                <div className="text-white text-xs font-medium">Rosie Russell, IIRSM President</div>
              </div>

              {/* Testimonial 3 */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={julianaBleyPhoto} alt="Juliana Bley" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"The psychology of safety in today's world require new skills to cope with the challenges, pressure and demands of a connected workplace."</p>
                <div className="text-white text-xs font-medium">Juliana Bley, TEDx Speaker, Psychologist</div>
              </div>

              {/* Testimonial 4 */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={jenniferMcnellyPhoto} alt="Jennifer McNelly" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"Most professionals today on the AI maturity curve are in the learning and exploring stage. There are, and will be, as in all industries and professions, leaders, laggards and those in the middle."</p>
                <div className="text-white text-xs font-medium">Jennifer McNelly, ASSP CEO</div>
              </div>

              {/* Testimonial 5 */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={stuartHughesPhoto} alt="Stuart Hughes" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"You can shape the future and create healthy and safe working environments that enable employees to thrive, and drive the sustainability of your organisation forward."</p>
                <div className="text-white text-xs font-medium">Stuart Hughes, IOSH Past President</div>
              </div>

              {/* Testimonial 6 */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={annaLopezPhoto} alt="Anna Lopez" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"From traditional safety to digital leadership in just 12 weeks."</p>
                <div className="text-white text-xs font-medium">Anna Lopez, Safety Specialist</div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={manalAzziPhoto} alt="Manal Azzi" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health."</p>
                <div className="text-white text-xs font-medium">Manal Azzi, ILO Team Lead</div>
              </div>

              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={rosieRussellPhoto} alt="Rosie Russell" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"We need to make AI mainstream in our conversations, but we must also make sure people truly understand it before relying on it."</p>
                <div className="text-white text-xs font-medium">Rosie Russell, IIRSM President</div>
              </div>

              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={julianaBleyPhoto} alt="Juliana Bley" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"The psychology of safety in today's world require new skills to cope with the challenges, pressure and demands of a connected workplace."</p>
                <div className="text-white text-xs font-medium">Juliana Bley, TEDx Speaker, Psychologist</div>
              </div>

              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={jenniferMcnellyPhoto} alt="Jennifer McNelly" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"Most professionals today on the AI maturity curve are in the learning and exploring stage. There are, and will be, as in all industries and professions, leaders, laggards and those in the middle."</p>
                <div className="text-white text-xs font-medium">Jennifer McNelly, ASSP CEO</div>
              </div>

              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={stuartHughesPhoto} alt="Stuart Hughes" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"You can shape the future and create healthy and safe working environments that enable employees to thrive, and drive the sustainability of your organisation forward."</p>
                <div className="text-white text-xs font-medium">Stuart Hughes, IOSH Past President</div>
              </div>

              <div className="flex-shrink-0 text-center space-y-3 w-80">
                <img src={annaLopezPhoto} alt="Anna Lopez" className="w-16 h-16 rounded-full mx-auto object-cover" />
                <p className="text-gray-300 text-sm italic">"From traditional safety to digital leadership in just 12 weeks."</p>
                <div className="text-white text-xs font-medium">Anna Lopez, Safety Specialist</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-4 md:p-6 shadow-card hover:shadow-glow transition-all duration-300 animate-slide-up border-0 bg-white"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <CardContent className="p-0">
                <div className="flex items-center mb-3 md:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="w-6 h-6 md:w-8 md:h-8 text-lime-500 fill-lime-500 mb-3 md:mb-4" />
                
                <p className="text-black mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-3 md:space-x-4">
                  {typeof testimonial.image === 'string' && testimonial.image.length <= 2 ? (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                      {testimonial.image}
                    </div>
                  ) : (
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
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
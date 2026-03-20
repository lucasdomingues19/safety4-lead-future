import legoLogo from "@/assets/lego-logo.png";
import siemensLogo from "@/assets/siemens-logo.jpeg";
import marshLogo from "@/assets/marsh-logo.jpg";
import samaLogo from "@/assets/sama-logo.png";
import crtsLogo from "@/assets/crts-global-logo.png";
import seadrillLogo from "@/assets/seadrill-logo-real.svg";
import velestroylLogo from "@/assets/velesstroy-logo.jpeg";
import nioshLogo from "@/assets/niosh-logo.png";
import soterLogo from "@/assets/soter-ai-logo.avif";
import fieldLogo from "@/assets/field-energy-logo.jpeg";
import fugroLogo from "@/assets/fugro-logo.png";

const logos = [
  { src: legoLogo, alt: "LEGO" },
  { src: siemensLogo, alt: "Siemens" },
  { src: marshLogo, alt: "Marsh" },
  { src: samaLogo, alt: "SAMA" },
  { src: crtsLogo, alt: "CRTS Global" },
  { src: seadrillLogo, alt: "Seadrill" },
  { src: velestroylLogo, alt: "Velesstroy" },
  { src: nioshLogo, alt: "NIOSH" },
  { src: soterLogo, alt: "Soter AI" },
  { src: fieldLogo, alt: "Field Energy" },
  { src: fugroLogo, alt: "Fugro" },
];

export const TrustedByBanner = () => {
  return (
    <div className="border-y border-white/10 py-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-[10px] tracking-[3px] text-gray-400 text-center mb-6 font-semibold">
          TRUSTED BY SAFETY TEAMS & PARTNERS AT
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
        <div className="flex animate-scroll w-max" style={{ animationDuration: "30s" }}>
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-12 md:gap-20 px-6">
              {logos.map((logo, i) => (
                <div
                  key={`${setIndex}-${i}`}
                  className="flex-shrink-0 bg-white rounded-xl p-4 flex items-center justify-center h-16 md:h-20 w-28 md:w-36 hover:scale-105 transition-transform"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-10 md:max-h-14 max-w-20 md:max-w-28 object-contain"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

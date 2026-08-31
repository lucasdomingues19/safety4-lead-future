import ioshBadge from "@/assets/iosh-approved-badge.png";
import cpdBadge from "@/assets/cpd-certified-badge.png";

export const ProfessionalCredentialsSection = () => {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Professional Credentials You Can Count On</h3>
          <p className="text-[#69697b] text-lg">Our courses are IOSH-approved and provide valuable CPD (Continuing Professional Development) hours for your career advancement.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <img src={ioshBadge} alt="IOSH Approved" className="h-32 md:h-40 object-contain" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">IOSH Approved</h4>
            <p className="text-slate-600 text-sm max-w-xs">Institution of Occupational Safety and Health certification ensures industry-recognized quality and relevance.</p>
          </div>
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <img src={cpdBadge} alt="CPD Certified" className="h-32 md:h-40 object-contain" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">CPD Hours Included</h4>
            <p className="text-slate-600 text-sm max-w-xs">Earn valuable CPD credits recognized by professional bodies to support your continuous learning journey.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

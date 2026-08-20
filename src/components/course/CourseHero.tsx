import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Infinity as InfinityIcon, Tablet, type LucideIcon } from "lucide-react";
import founderPhoto from "@/assets/founder-cutout.png";

export interface CourseFeature {
  icon: LucideIcon;
  label: string;
}

export interface CourseMetaRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface CTA {
  label: string;
  href: string;
  external?: boolean;
}

interface CourseHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  features: CourseFeature[];
  icon: string;
  badgeSrc: string;
  price: string;
  originalPrice?: string;
  period?: string;
  meta: CourseMetaRow[];
  cta: CTA;
  secondaryCta?: CTA;
  guarantee?: string;
}

export const CourseHero = ({
  eyebrow,
  title,
  subtitle,
  features,
  icon,
  badgeSrc,
  price,
  originalPrice,
  period,
  meta,
  cta,
  secondaryCta,
  guarantee,
}: CourseHeroProps) => {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 max-w-6xl mx-auto items-start">
          {/* Left — title, subtitle, features, instructor */}
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4 block">
              {eyebrow}
            </span>
            <h1 className="mb-5 leading-[1.05]">{title}</h1>
            <p className="text-lg text-[#69697b] leading-relaxed mb-10 max-w-xl">
              {subtitle}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between max-w-xl">
              <Link to="/about-us" className="inline-flex items-center gap-3 group">
                <img
                  src={founderPhoto}
                  alt="Lucas Domingues"
                  className="w-11 h-11 rounded-full object-cover object-top bg-slate-100"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                    Lucas Domingues
                  </div>
                  <div className="text-xs text-[#69697b]">MSc, CMIOSH — Course Instructor</div>
                </div>
              </Link>

              <img
                src={badgeSrc}
                alt="Accreditation badge"
                className="w-24 h-24 rounded-xl shadow-lg rotate-3 animate-float"
              />
            </div>
          </div>

          {/* Right — sticky price/meta card */}
          <div className="lg:sticky lg:top-28">
            <div className="rounded-[20px] border border-slate-200 shadow-lg overflow-hidden bg-white">
              <div className="relative h-44 bg-white border-2 border-primary overflow-hidden flex items-center justify-center">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/5 rounded-full" />
                <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-primary/5 rounded-full" />
                <img src={icon} alt="" className="relative w-28 h-28 object-contain" />
              </div>

              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-1">
                  {originalPrice && (
                    <span className="text-slate-400 text-base line-through">{originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold text-slate-900">{price}</span>
                  {period && <span className="text-[#69697b] text-sm">{period}</span>}
                </div>

                {cta.external ? (
                  <a
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full px-6 py-[18px] bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
                  >
                    {cta.label}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    to={cta.href}
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full px-6 py-[18px] bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
                  >
                    {cta.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {secondaryCta && (
                  secondaryCta.external ? (
                    <a
                      href={secondaryCta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 w-full px-6 py-[14px] border border-primary text-primary font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors"
                    >
                      {secondaryCta.label}
                    </a>
                  ) : (
                    <Link
                      to={secondaryCta.href}
                      className="mt-3 inline-flex items-center justify-center gap-2 w-full px-6 py-[14px] border border-primary text-primary font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors"
                    >
                      {secondaryCta.label}
                    </Link>
                  )
                )}

                {guarantee && (
                  <p className="text-center text-xs text-slate-500 mt-3">{guarantee}</p>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  {meta.map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <m.icon className="w-4 h-4 text-primary" />
                        {m.label}
                      </div>
                      <span className="font-medium text-slate-900">{m.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <Tablet className="w-4 h-4 text-primary shrink-0" />
                  Access from any computer, tablet or mobile
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <InfinityIcon className="w-4 h-4 text-primary shrink-0" />
                  Lifetime access to course materials
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

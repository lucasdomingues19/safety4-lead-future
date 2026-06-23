import AudienceNav from "@/components/AudienceNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setPageSEO } from "@/utils/seo";

export default function AntiPiracyPolicy() {
  useEffect(() => {
    setPageSEO({
      title: "Anti-Piracy Policy | Safety 4.0 Academy",
      description: "Safety 4.0 Academy's Anti-Piracy Policy. Learn about our intellectual property protection measures for IOSH-approved course materials and digital content.",
      canonical: "https://safetyacademy.tech/anti-piracy-policy",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="outline" className="mb-8 border-slate-300 text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Anti-Piracy Policy</h1>
          
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Protection of Intellectual Property</h2>
              <p>
                Safety 4.0 Academy is committed to protecting its intellectual property rights. All course materials, 
                videos, documents, assessments, and content are protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Prohibited Activities</h2>
              <p className="mb-3">The following activities are strictly prohibited:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Unauthorized copying, distribution, or sharing of course materials</li>
                <li>Recording, downloading, or screen capturing course videos without permission</li>
                <li>Sharing login credentials with unauthorized users</li>
                <li>Reselling, redistributing, or commercially exploiting course content</li>
                <li>Creating derivative works based on our proprietary content</li>
                <li>Using our content for competitive purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Detection and Enforcement</h2>
              <p>
                We employ advanced technologies to detect and prevent unauthorized use of our content, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Digital watermarking and tracking systems</li>
                <li>Account activity monitoring</li>
                <li>Automated piracy detection tools</li>
                <li>Regular audits of content distribution</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Consequences of Violation</h2>
              <p className="mb-3">Violations of this policy will result in:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Immediate termination of account access</li>
                <li>Forfeiture of all paid fees without refund</li>
                <li>Legal action seeking damages and injunctive relief</li>
                <li>Reporting to relevant authorities and platforms</li>
                <li>Potential criminal prosecution under applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Reporting Piracy</h2>
              <p>
                If you become aware of any unauthorized use or distribution of Safety 4.0 Academy content, 
                please report it immediately to <a href="mailto:hello@safetyacademy.tech" className="text-primary hover:text-primary/80">hello@safetyacademy.tech</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Legal Rights</h2>
              <p>
                Safety 4.0 Academy reserves all rights under copyright law and will pursue all available legal 
                remedies against individuals or organizations that violate this policy. This includes but is not 
                limited to statutory damages, actual damages, legal fees, and injunctive relief.
              </p>
            </section>

            <p className="text-sm text-slate-500 pt-6 border-t border-slate-200">
              Last updated: October 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

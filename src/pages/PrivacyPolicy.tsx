import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setPageSEO } from "@/utils/seo";

export default function PrivacyPolicy() {
  useEffect(() => {
    setPageSEO({
      title: "Privacy Policy | Safety 4.0 Academy",
      description: "Safety 4.0 Academy's Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and international privacy standards.",
      canonical: "https://safetyacademy.tech/privacy-policy",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="outline" className="mb-8 border-white/30 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
              <p>
                Safety 4.0 Academy ("we", "our", or "us") is committed to protecting your privacy and ensuring 
                the security of your personal data. This Privacy Policy explains how we collect, use, store, and 
                protect your information in compliance with the General Data Protection Regulation (GDPR) and 
                other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Controller</h2>
              <p>
                Safety 4.0 Academy is the data controller responsible for your personal data. If you have any 
                questions about this policy or our data practices, please contact us at{" "}
                <a href="mailto:hello@safetyacademy.tech" className="text-lime-400 hover:text-lime-300">
                  hello@safetyacademy.tech
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <p className="mb-3">We collect and process the following types of personal data:</p>
              
              <div className="space-y-3 ml-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Password (encrypted)</li>
                    <li>Professional information (job title, company, industry)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Course Activity Data</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Course enrollment and completion records</li>
                    <li>Assessment results and progress</li>
                    <li>Certificate issuance data</li>
                    <li>Learning preferences and settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Technical Data</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Usage data and analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Payment Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Billing address</li>
                    <li>Payment method (processed securely by third-party payment processors)</li>
                    <li>Transaction history</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Legal Basis for Processing</h2>
              <p className="mb-3">We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Contract Performance:</strong> To provide our courses and services to you</li>
                <li><strong>Legitimate Interest:</strong> To improve our services, prevent fraud, and ensure security</li>
                <li><strong>Legal Obligation:</strong> To comply with legal and regulatory requirements</li>
                <li><strong>Consent:</strong> For marketing communications and certain optional features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <p className="mb-3">We use your personal data for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing access to course materials and platform features</li>
                <li>Processing payments and managing your account</li>
                <li>Issuing certificates and tracking your progress</li>
                <li>Communicating with you about courses, updates, and support</li>
                <li>Improving our platform and educational content</li>
                <li>Complying with legal obligations and maintaining accreditation standards</li>
                <li>Sending marketing communications (with your consent)</li>
                <li>Detecting and preventing fraud or security breaches</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing and Disclosure</h2>
              <p className="mb-3">We may share your personal data with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Accreditation Bodies:</strong> IOSH and CPD for certification purposes</li>
                <li><strong>Service Providers:</strong> Payment processors, email services, hosting providers (under strict data processing agreements)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal data to third parties. All third-party service providers are 
                required to maintain appropriate security measures and use your data only for specified purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA). 
                Where this occurs, we ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Privacy Shield certification (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Retention</h2>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in 
                this policy or as required by law. Specific retention periods include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Account data: Duration of your account plus 7 years (for accreditation and legal requirements)</li>
                <li>Course completion and certificates: Indefinitely (for verification purposes)</li>
                <li>Payment records: 7 years (for tax and accounting purposes)</li>
                <li>Marketing data: Until you withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights Under GDPR</h2>
              <p className="mb-3">You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:hello@safetyacademy.tech" className="text-lime-400 hover:text-lime-300">
                  hello@safetyacademy.tech
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal 
                data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication protocols</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Automated Decision-Making</h2>
              <p>
                We do not use automated decision-making or profiling that produces legal effects or 
                significantly affects you without human intervention.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under 18 years of age. We do not knowingly 
                collect personal data from children. If we become aware that we have collected data from 
                a child, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will notify you of any material changes 
                by email or through our platform. The updated policy will indicate the date of the latest revision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="mt-3 space-y-2">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:hello@safetyacademy.tech" className="text-lime-400 hover:text-lime-300">
                    hello@safetyacademy.tech
                  </a>
                </p>
                <p><strong>Data Protection Officer:</strong> Available upon request</p>
              </div>
            </section>

            <p className="text-sm text-gray-400 pt-6 border-t border-white/10">
              Last updated: October 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

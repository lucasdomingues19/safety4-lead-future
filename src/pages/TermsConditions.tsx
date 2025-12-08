import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsConditions() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
          
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction and Acceptance</h2>
              <p className="mb-4">
                Safety 4.0 Academy is a product owned and operated by Shield360 Ltd, company number 16266290, 
                registered in England.
              </p>
              <p>
                These Terms and Conditions ("Terms") govern your use of Safety 4.0 Academy's website, courses, 
                and services. By accessing or using our services, you agree to be bound by these Terms. If you 
                disagree with any part of these Terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>"Platform"</strong> refers to Safety 4.0 Academy's website and learning management system</li>
                <li><strong>"Services"</strong> include all courses, materials, certifications, and related offerings</li>
                <li><strong>"User"</strong> or "You" refers to the individual or entity accessing our services</li>
                <li><strong>"Content"</strong> means all materials, videos, documents, and resources provided through the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration and Eligibility</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">3.1 Eligibility</h3>
              <p>You must be at least 18 years old to use our services. By registering, you represent that you meet this age requirement.</p>
              
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">3.2 Account Creation</h3>
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">3.3 Account Restrictions</h3>
              <p>You may not:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Share your account credentials with others</li>
                <li>Create multiple accounts for fraudulent purposes</li>
                <li>Use another person's account without permission</li>
                <li>Transfer your account to another party</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Course Enrollment and Access</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">4.1 Course Purchase</h3>
              <p>
                When you enroll in a course, you are purchasing a personal, non-transferable license to access 
                the course materials for the duration specified at the time of purchase.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">4.2 Access Duration</h3>
              <p>
                Upon enrollment, you are granted lifetime access to the course materials. This means you can 
                access and revisit the content indefinitely, subject to the Platform remaining operational.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">4.3 Platform Availability</h3>
              <p>
                While we strive for 99.9% uptime, we do not guarantee uninterrupted access. We may suspend 
                services temporarily for maintenance, updates, or technical issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Payment and Pricing</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">5.1 Pricing</h3>
              <p>
                All prices are displayed in the currency indicated at the time of purchase. Prices are subject 
                to change without notice, but changes will not affect existing enrollments.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">5.2 Payment Processing</h3>
              <p>
                Payments are processed securely through third-party payment processors. You agree to provide 
                valid payment information and authorize us to charge the specified amount.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">5.3 Taxes</h3>
              <p>
                You are responsible for any applicable taxes, duties, or other governmental charges. Where 
                required, we will collect and remit applicable taxes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Refund and Cancellation Policy</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">6.1 Refund Eligibility</h3>
              <p>
                We offer a 14-day money-back guarantee from the date of purchase, provided you have not 
                completed more than 20% of the course content or obtained certification.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">6.2 Refund Process</h3>
              <p>
                To request a refund, contact us at{" "}
                <a href="mailto:hello@getshield360.com" className="text-lime-400 hover:text-lime-300">
                  hello@getshield360.com
                </a>
                {" "}with your order details. Refunds are processed within 10-14 business days.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">6.3 Non-Refundable Items</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Completed courses with issued certificates</li>
                <li>Promotional or discounted courses (unless required by law)</li>
                <li>Corporate or bulk licenses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property Rights</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">7.1 Ownership</h3>
              <p>
                All Content, trademarks, logos, and intellectual property on the Platform are owned by or 
                licensed to Safety 4.0 Academy. This includes course materials, videos, assessments, and documentation.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">7.2 Limited License</h3>
              <p>We grant you a limited, non-exclusive, non-transferable license to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Access and view course materials for personal educational purposes</li>
                <li>Download materials explicitly marked as downloadable</li>
                <li>Print materials for personal study use only</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">7.3 Restrictions</h3>
              <p>You may not:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Copy, reproduce, or distribute course materials</li>
                <li>Modify, adapt, or create derivative works</li>
                <li>Record, screen capture, or share videos</li>
                <li>Use Content for commercial purposes</li>
                <li>Remove copyright notices or proprietary markings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Certification and Accreditation</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">8.1 Certification Requirements</h3>
              <p>
                To receive certification, you must complete all required course modules, pass assessments with 
                the minimum required scores, and comply with all academic integrity policies.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">8.2 Certificate Validity</h3>
              <p>
                Certificates are issued by IOSH and CPD. Certificate validity 
                and renewal requirements are specified in the course materials.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">8.3 Certificate Revocation</h3>
              <p>
                We reserve the right to revoke certificates if we discover academic misconduct, violation of 
                Terms, or misrepresentation of credentials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. User Conduct and Prohibited Activities</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code, viruses, or harmful software</li>
                <li>Attempt to gain unauthorized access to systems or accounts</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Engage in fraudulent activities or misrepresent your identity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Reverse engineer or decompile any part of the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Disclaimers and Limitations of Liability</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">10.1 Educational Purpose</h3>
              <p>
                Our courses are for educational purposes only. While we strive for accuracy, we do not guarantee 
                that course content is error-free, current, or complete. Professional advice should be sought 
                for specific situations.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">10.2 Career Outcomes</h3>
              <p>
                We do not guarantee specific career outcomes, job placement, salary increases, or promotions 
                as a result of completing our courses.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">10.3 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Safety 4.0 Academy shall not be liable for any indirect, 
                incidental, consequential, or punitive damages arising from your use of the Platform or Services. 
                Our total liability shall not exceed the amount you paid for the specific course or service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Safety 4.0 Academy, its officers, directors, 
                employees, and agents from any claims, damages, losses, liabilities, and expenses (including 
                legal fees) arising from your violation of these Terms or misuse of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Termination</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">12.1 Termination by You</h3>
              <p>
                You may terminate your account at any time by contacting us. Termination does not entitle you 
                to a refund unless within the refund period specified in Section 6.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">12.2 Termination by Us</h3>
              <p>We may suspend or terminate your access immediately if you:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Violate these Terms or our policies</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Damage our reputation or interests</li>
                <li>Fail to make required payments</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">12.3 Effect of Termination</h3>
              <p>
                Upon termination, your right to access the Platform and Content immediately ceases. Provisions 
                regarding intellectual property, disclaimers, and limitations of liability survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
                your personal data in compliance with GDPR and other applicable laws. By using our Services, 
                you consent to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material changes 
                via email or Platform notification. Continued use of the Services after changes constitutes 
                acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Governing Law and Dispute Resolution</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">15.1 Governing Law</h3>
              <p>
                These Terms are governed by and construed in accordance with the laws of England and Wales, 
                without regard to conflict of law principles.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">15.2 Dispute Resolution</h3>
              <p>
                Any disputes arising from these Terms shall first be attempted to be resolved through good-faith 
                negotiation. If unsuccessful, disputes shall be resolved through binding arbitration or in the 
                courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">16. Miscellaneous Provisions</h2>
              <h3 className="text-lg font-semibold text-white mb-2 mt-3">16.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and other referenced policies, constitute the 
                entire agreement between you and Safety 4.0 Academy.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">16.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
                shall remain in full force and effect.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">16.3 Waiver</h3>
              <p>
                Our failure to enforce any right or provision shall not constitute a waiver of future enforcement 
                of that right or provision.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-3">16.4 Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our written consent. We may assign our rights 
                and obligations without restriction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">17. Contact Information</h2>
              <p>For questions about these Terms, please contact us:</p>
              <div className="mt-3 space-y-2">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:hello@getshield360.com" className="text-lime-400 hover:text-lime-300">
                    hello@getshield360.com
                  </a>
                </p>
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

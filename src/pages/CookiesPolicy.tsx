import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function CookiesPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Cookies Policy</h1>
          
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us 
                provide you with a better experience by remembering your preferences and understanding how you use our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <p className="mb-3">Safety 4.0 Academy uses cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Functionality Cookies:</strong> Remember your preferences and personalize your experience</li>
                <li><strong>Analytics Cookies:</strong> Collect information about how you use our site to help us improve it</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Session Cookies</h3>
                  <p>
                    Temporary cookies that are deleted when you close your browser. These are essential for maintaining 
                    your login session and ensuring secure navigation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Persistent Cookies</h3>
                  <p>
                    Remain on your device for a set period or until you delete them. These help us remember your 
                    preferences across multiple visits.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Third-Party Cookies</h3>
                  <p>
                    Set by third-party services we use, such as analytics providers and payment processors. These help 
                    us understand user behavior and provide secure payment processing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Managing Cookies</h2>
              <p className="mb-3">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Most browsers allow you to refuse cookies or delete existing ones through browser settings</li>
                <li>You can set your browser to notify you when cookies are being sent</li>
                <li>You can use browser add-ons or privacy tools to manage cookies</li>
              </ul>
              <p className="mt-3">
                Please note that blocking or deleting cookies may impact your ability to use certain features of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Cookie Retention</h2>
              <p>
                Different cookies have different retention periods:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Session cookies: Deleted when you close your browser</li>
                <li>Authentication cookies: Typically 30 days</li>
                <li>Preference cookies: Up to 1 year</li>
                <li>Analytics cookies: Up to 2 years</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Consent</h2>
              <p>
                By continuing to use our website, you consent to our use of cookies as described in this policy. 
                You can withdraw your consent at any time by adjusting your browser settings or contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Updates to This Policy</h2>
              <p>
                We may update this Cookies Policy from time to time to reflect changes in technology, legislation, 
                or our business practices. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{" "}
                <a href="mailto:privacy@safety40academy.com" className="text-lime-400 hover:text-lime-300">
                  privacy@safety40academy.com
                </a>
              </p>
            </section>

            <p className="text-sm text-gray-400 pt-6 border-t border-white/10">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

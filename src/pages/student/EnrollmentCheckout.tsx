import { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Clock, Users, Star, Shield, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EnrollmentCheckout = () => {
  const [step, setStep] = useState<"review" | "payment" | "confirmation">("review");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const course = {
    id: 1,
    title: "Introduction to AI-Powered EHS",
    description: "Learn how artificial intelligence is transforming modern EHS practices",
    instructor: "Lucas Domingues",
    price: 49.99,
    students: 1240,
    rating: 4.8,
    reviews: 342,
    duration: "12 hours",
    lessons: 28,
    modules: 5,
    level: "Intermediate",
    image: null,
    includes: [
      "Lifetime access to course materials",
      "12 hours of video content",
      "Downloadable resources",
      "Certificate of completion",
      "Community forum access",
      "Email support",
    ],
  };

  const handleEnroll = async () => {
    if (course.price === 0) {
      setIsProcessing(true);
      setTimeout(() => {
        setStep("confirmation");
        setIsProcessing(false);
      }, 1500);
    } else {
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-checkout",
        {
          body: {
            courseId: course.id.toString(),
            courseName: course.title,
            price: course.price,
            userId: "user-123",
            userEmail: "student@example.com",
            successUrl: `${window.location.origin}/student/checkout/${course.id}?success=true`,
            cancelUrl: `${window.location.origin}/student/checkout/${course.id}`,
          },
        }
      );

      if (error) throw error;

      toast.success("Payment processing...");

      setTimeout(() => {
        setStep("confirmation");
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment failed. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        body, html { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Accent bar */}
      <div className="fixed left-0 top-0 w-1 h-screen" style={{ backgroundColor: "#3434FF" }}></div>

      {/* Header */}
      <div className="bg-white px-8 py-8 ml-1" style={{ borderColor: "#ECECF4" }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: "#69697B" }} />
          </button>
          <h1 className="text-3xl font-bold" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.3px" }}>
            {step === "review" ? "Review Course" : step === "payment" ? "Payment Details" : "Enrollment Complete"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12 ml-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "review" && (
              <div className="space-y-8">
                {/* Course Hero */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #ECECF4", borderLeft: "4px solid #3434FF" }}>
                  <div className="h-64" style={{ background: "linear-gradient(135deg, #3434FF15 0%, #F5F7FF 100%)" }}>
                    <div className="w-24 h-24 rounded-full mx-auto mt-16" style={{ background: "#3434FF", opacity: 0.08 }} />
                  </div>

                  <div className="p-8">
                    <h2 className="text-4xl font-bold mb-3" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: "-0.3px" }}>
                      {course.title}
                    </h2>
                    <p className="text-lg mb-6" style={{ color: "#69697B" }}>
                      {course.description}
                    </p>

                    <div className="flex items-center gap-6 mb-8">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5"
                              style={{
                                fill: i < Math.floor(course.rating) ? "#f59e0b" : "#e5e7eb",
                                color: i < Math.floor(course.rating) ? "#f59e0b" : "#e5e7eb",
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#0B0B2C" }}>
                          {course.rating} ({course.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: "#69697B" }}>
                        <Users className="w-5 h-5" />
                        <span>{course.students.toLocaleString()} students</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" style={{ color: "#69697B" }} />
                        <span style={{ color: "#69697B" }}>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" style={{ color: "#69697B" }} />
                        <span style={{ color: "#69697B" }}>{course.level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="rounded-2xl border-2 p-8" style={{ borderColor: "#ECECF4" }}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: "#0B0B2C" }}>
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    {course.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                        <span style={{ color: "#69697B" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Terms */}
                <div className="rounded-2xl border-2 p-8" style={{ borderColor: "#ECECF4" }}>
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-5 h-5 rounded mt-0.5"
                    />
                    <div>
                      <p className="font-bold mb-1" style={{ color: "#0B0B2C" }}>
                        I agree to the Terms of Service
                      </p>
                      <p className="text-sm" style={{ color: "#69697B" }}>
                        By enrolling, you agree to our course terms and policies. You will have
                        lifetime access to the course materials.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="rounded-2xl border-2 p-8" style={{ borderColor: "#ECECF4" }}>
                <h2 className="text-2xl font-bold mb-8" style={{ color: "#0B0B2C" }}>
                  Payment Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#0B0B2C" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#0B0B2C" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#0B0B2C" }}>
                      Card Information
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 mb-3"
                      style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}
                      placeholder="1234 5678 9012 3456"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2"
                        style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}
                        placeholder="MM/YY"
                      />
                      <input
                        type="text"
                        className="px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2"
                        style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}
                        placeholder="CVV"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg border-2" style={{ borderColor: "#3434FF", backgroundColor: "rgba(52, 52, 255, 0.05)" }}>
                    <Shield className="w-5 h-5" style={{ color: "#3434FF" }} />
                    <p className="text-sm" style={{ color: "#3434FF" }}>
                      Your payment is secure and encrypted
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === "confirmation" && (
              <div className="text-center space-y-8">
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(22, 163, 74, 0.1)" }}>
                      <CheckCircle2 className="w-12 h-12" style={{ color: "#16a34a" }} />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold mb-3" style={{ color: "#0B0B2C" }}>
                    Enrollment Confirmed!
                  </h2>
                  <p className="text-lg" style={{ color: "#69697B" }}>
                    Welcome to {course.title}
                  </p>
                </div>

                <div className="rounded-2xl border-2 p-8" style={{ borderColor: "#16a34a", backgroundColor: "rgba(22, 163, 74, 0.05)" }}>
                  <h3 className="font-bold mb-4" style={{ color: "#0B0B2C" }}>
                    What's Next?
                  </h3>
                  <ol className="space-y-3 text-left">
                    <li className="flex gap-3">
                      <span className="font-bold flex-shrink-0" style={{ color: "#16a34a" }}>1.</span>
                      <span style={{ color: "#69697B" }}>
                        Check your email for your enrollment confirmation
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold flex-shrink-0" style={{ color: "#16a34a" }}>2.</span>
                      <span style={{ color: "#69697B" }}>
                        Access the course from your learning dashboard
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold flex-shrink-0" style={{ color: "#16a34a" }}>3.</span>
                      <span style={{ color: "#69697B" }}>
                        Start learning at your own pace
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border-2 bg-white p-6 sticky top-8" style={{ borderColor: "#ECECF4" }}>
              {/* Price Card */}
              {step === "review" && (
                <>
                  <div className="mb-6">
                    {course.price === 0 ? (
                      <div>
                        <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>
                          FREE
                        </p>
                        <p className="text-sm" style={{ color: "#69697B" }}>
                          Enroll at no cost
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold" style={{ color: "#0B0B2C" }}>
                          ${course.price}
                        </p>
                        <p className="text-sm" style={{ color: "#69697B" }}>
                          One-time payment
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={!agreeToTerms}
                    className="w-full py-3 rounded-lg font-bold text-white transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#3434FF" }}
                  >
                    {course.price === 0 ? "Enroll Now" : "Continue to Payment"}
                  </button>

                  <button className="w-full py-3 rounded-lg font-bold border-2 transition-colors" style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}>
                    Learn More
                  </button>
                </>
              )}

              {step === "payment" && (
                <>
                  <div className="mb-6 pb-6 border-b" style={{ borderColor: "#ECECF4" }}>
                    <p className="text-sm mb-2" style={{ color: "#69697B" }}>
                      Amount to Pay
                    </p>
                    <p className="text-3xl font-bold" style={{ color: "#0B0B2C" }}>
                      ${course.price}
                    </p>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-lg font-bold text-white transition-all"
                    style={{ background: "#3434FF" }}
                  >
                    {isProcessing ? "Processing..." : "Complete Payment"}
                  </button>
                </>
              )}

              {step === "confirmation" && (
                <>
                  <button className="w-full py-3 rounded-lg font-bold text-white transition-all mb-3" style={{ background: "#3434FF" }}>
                    Go to Course
                  </button>
                  <button className="w-full py-3 rounded-lg font-bold border-2 transition-colors" style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}>
                    Back to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentCheckout;

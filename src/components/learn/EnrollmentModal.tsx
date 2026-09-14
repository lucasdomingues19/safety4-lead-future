import { useState } from "react";
import { Loader2, Check, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { enrollInFreeCourse } from "@/lib/enrollment";
import { formatPrice, type Course } from "@/lib/lms";

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  userId: string;
  onEnrolled: () => void;
}

export function EnrollmentModal({
  open,
  onOpenChange,
  course,
  userId,
  onEnrolled,
}: EnrollmentModalProps) {
  const [enrolling, setEnrolling] = useState(false);
  const isFree = !course.price_cents || course.price_cents === 0;

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollInFreeCourse(userId, course.id);
      toast.success(`Enrolled in ${course.title}!`);
      onOpenChange(false);
      onEnrolled();
    } catch (err) {
      console.error(err);
      toast.error("Failed to enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handlePayment = () => {
    toast.info("Stripe integration coming soon");
    // TODO: Redirect to Stripe checkout
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(11,11,44,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => onOpenChange(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              maxWidth: "540px",
              width: "100%",
              padding: "40px",
              boxShadow: "0 30px 60px rgba(11,11,44,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: "#8ab815",
                  textTransform: "uppercase",
                }}
              >
                {isFree ? "Free course" : "Premium course"}
              </div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#0b0b2c",
                  margin: "12px 0 0",
                }}
              >
                {course.title}
              </h2>
            </div>

            {/* Course Info */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "28px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {course.cpd_hours && (
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                    }}
                  >
                    CPD Hours
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0b0b2c",
                      marginTop: "4px",
                    }}
                  >
                    {course.cpd_hours} hours
                  </div>
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  Price
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0b0b2c",
                    marginTop: "4px",
                  }}
                >
                  {formatPrice(course.price_cents, course.currency)}
                </div>
              </div>
            </div>

            {/* Description */}
            {course.description && (
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#69697b",
                  marginBottom: "28px",
                }}
              >
                {course.description}
              </p>
            )}

            {/* Benefits */}
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0b0b2c",
                  marginBottom: "12px",
                }}
              >
                What you'll get:
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  "Video lessons with transcripts",
                  "Interactive quizzes with AI grading",
                  "Certificate of completion",
                  "Lifetime access to course materials",
                ].map((benefit, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={18} color="#8ab815" />
                    <span style={{ fontSize: "14px", color: "#69697b" }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning for paid courses (payment not yet implemented) */}
            {!isFree && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "28px",
                }}
              >
                <AlertCircle size={16} color="#92400e" />
                <span style={{ fontSize: "13px", color: "#92400e" }}>
                  Payment system implementation coming soon
                </span>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  flex: 1,
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "14px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                Cancel
              </button>

              <button
                onClick={isFree ? handleEnroll : handlePayment}
                disabled={enrolling}
                style={{
                  flex: 1,
                  border: "0",
                  borderRadius: "8px",
                  background: isFree ? "#3434ff" : "#a6e21a",
                  color: isFree ? "#fff" : "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "14px 20px",
                  cursor: enrolling ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: enrolling ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!enrolling) {
                    e.currentTarget.style.background = isFree ? "#2a2ad6" : "#93cc12";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!enrolling) {
                    e.currentTarget.style.background = isFree ? "#3434ff" : "#a6e21a";
                  }
                }}
              >
                {enrolling && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                {enrolling ? "Enrolling..." : isFree ? "Enroll for free" : `Enroll for ${formatPrice(course.price_cents, course.currency)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

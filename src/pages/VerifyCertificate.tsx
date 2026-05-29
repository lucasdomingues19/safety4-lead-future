import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CertificateDocument, type CertificateData } from "@/components/certificates/CertificateDocument";
import { BadgeMedallion } from "@/components/certificates/BadgeMedallion";
import { CheckCircle2, XCircle, Download, Share2, Linkedin, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SITE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://www.safetyacademy.tech";

type Status = "loading" | "valid" | "revoked" | "notfound" | "search";

const VerifyCertificate = () => {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(certificateNumber ? "loading" : "search");
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const certRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const verifyUrl = `${SITE_URL}/verify/${certificateNumber}`;

  useEffect(() => {
    const lookup = async () => {
      if (!certificateNumber) {
        setStatus("search");
        return;
      }
      const { data, error } = await supabase.rpc("verify_certificate" as never, {
        _certificate_number: certificateNumber,
      } as never);

      const result = data as unknown;
      const row = Array.isArray(result) ? (result[0] ?? null) : result;
      if (error || !row) {
        setStatus("notfound");
        return;
      }
      setCert(row as CertificateData);
      setStatus((row as CertificateData).status === "revoked" ? "revoked" : "valid");
    };
    lookup();
  }, [certificateNumber]);

  const downloadCertificatePdf = async () => {
    if (!certRef.current) return;
    try {
      toast.loading("Preparing your certificate…", { id: "pdf" });
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Safety4-Certificate-${cert?.certificate_number}.pdf`);
      toast.success("Certificate downloaded", { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error("Could not generate the PDF", { id: "pdf" });
    }
  };

  const downloadBadge = async () => {
    if (!badgeRef.current) return;
    try {
      toast.loading("Preparing your badge…", { id: "badge" });
      const canvas = await html2canvas(badgeRef.current, { scale: 3, backgroundColor: null, useCORS: true });
      const link = document.createElement("a");
      link.download = `Safety4-Badge-${cert?.certificate_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Badge downloaded", { id: "badge" });
    } catch (e) {
      console.error(e);
      toast.error("Could not generate the badge", { id: "badge" });
    }
  };

  const linkedInAddToProfile = () => {
    if (!cert) return;
    const d = new Date(cert.completion_date);
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: cert.course_name,
      organizationName: "Safety 4.0 Academy",
      issueYear: String(d.getFullYear()),
      issueMonth: String(d.getMonth() + 1),
      certUrl: verifyUrl,
      certId: cert.certificate_number,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, "_blank", "noopener");
  };

  const linkedInSharePost = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
      "_blank",
      "noopener",
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Certificate not found</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          We couldn't find a certificate with the number{" "}
          <span className="font-mono text-foreground">{certificateNumber}</span>. Please check the number and try again.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Verification banner */}
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 mb-8 ${
            status === "valid"
              ? "border-primary/40 bg-primary/10"
              : "border-destructive/40 bg-destructive/10"
          }`}
        >
          {status === "valid" ? (
            <CheckCircle2 className="h-7 w-7 text-primary shrink-0" />
          ) : (
            <XCircle className="h-7 w-7 text-destructive shrink-0" />
          )}
          <div>
            <p className="font-semibold text-foreground">
              {status === "valid" ? "Verified authentic certificate" : "This certificate has been revoked"}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Issued by Safety 4.0 Academy · No. {cert?.certificate_number}
            </p>
          </div>
        </div>

        {/* Certificate */}
        <div className="overflow-x-auto rounded-xl shadow-2xl mb-8">
          <div className="mx-auto" style={{ width: "fit-content" }}>
            <CertificateDocument ref={certRef} cert={cert!} verifyUrl={verifyUrl} />
          </div>
        </div>

        {/* Actions + badge */}
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Share & download</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={downloadCertificatePdf}>
                <Download className="mr-2 h-4 w-4" /> Download certificate (PDF)
              </Button>
              <Button onClick={downloadBadge} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Download badge (PNG)
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={linkedInAddToProfile} className="bg-[#0a66c2] hover:bg-[#084a8f] text-white">
                <Linkedin className="mr-2 h-4 w-4" /> Add to LinkedIn profile
              </Button>
              <Button onClick={linkedInSharePost} variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Share as a post
              </Button>
            </div>
            <div className="pt-6 text-sm text-muted-foreground space-y-1">
              <p><span className="text-foreground font-medium">Recipient:</span> {cert?.recipient_name}</p>
              <p><span className="text-foreground font-medium">Course:</span> {cert?.course_name}</p>
              <p>
                <span className="text-foreground font-medium">Completed:</span>{" "}
                {cert && new Date(cert.completion_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              {cert?.cpd_hours ? <p><span className="text-foreground font-medium">CPD Hours:</span> {cert.cpd_hours}</p> : null}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <BadgeMedallion ref={badgeRef} cert={cert!} size={260} />
            <p className="text-xs text-muted-foreground">Your shareable badge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;

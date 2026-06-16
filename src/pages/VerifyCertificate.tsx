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

      // Make sure web fonts and every image are fully ready before we rasterise,
      // otherwise html2canvas captures fallback fonts / blank images and the PDF
      // no longer matches the on-screen certificate (shifted lines, empty boxes).
      if (document.fonts?.ready) await document.fonts.ready;
      const imgs = Array.from(certRef.current.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              }),
        ),
      );

      const node = certRef.current;
      // High device-independent resolution so the exported PDF is crisp when
      // zoomed or printed. Cap by devicePixelRatio so retina screens don't
      // double it again. backgroundColor matches the navy so no white edge
      // can show through any sub-pixel rounding gap.
      const scale = Math.max(3, Math.min(4, (window.devicePixelRatio || 1) * 2));
      const canvas = await html2canvas(node, {
        scale,
        backgroundColor: "#05080f",
        useCORS: true,
        imageTimeout: 15000,
        width: node.offsetWidth,
        height: node.offsetHeight,
        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
        compress: true,
      });
      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
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
      if (document.fonts?.ready) await document.fonts.ready;
      const bImgs = Array.from(badgeRef.current.querySelectorAll("img"));
      await Promise.all(
        bImgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              }),
        ),
      );
      const canvas = await html2canvas(badgeRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        imageTimeout: 15000,
      });
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

  const openInNewTab = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    openInNewTab(`https://www.linkedin.com/profile/add?${params.toString()}`);
  };

  const linkedInSharePost = () => {
    if (!cert) return;
    // LinkedIn's feed composer pre-fills from the `text` param. The user can edit
    // everything before posting. Including the verify URL lets LinkedIn attach a
    // link preview and gives readers a one-click way to confirm the certificate.
    const template =
      `I am excited to share that I have just completed the ${cert.course_name} ` +
      `with the Safety 4.0 Academy. I am ready to lead safety forward!\n\n` +
      `Verify my certificate: ${verifyUrl}\n` +
      `Safety 4.0 Academy: https://www.linkedin.com/company/safety40academy`;
    openInNewTab(
      `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(template)}`,
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

  if (status === "search") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <ShieldCheck className="h-14 w-14 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Verify a certificate</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Enter a Safety 4.0 Academy certificate number to confirm it's genuine.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = searchValue.trim();
            if (v) navigate(`/verify/${encodeURIComponent(v)}`);
          }}
          className="flex w-full max-w-md gap-2"
        >
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="e.g. SA4-2026-00001"
            className="flex-1 rounded-md border border-border bg-card px-4 py-2 text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit">Verify</Button>
        </form>
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

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CertificateDocument, type CertificateData } from "@/components/certificates/CertificateDocument";
import { BadgeMedallion } from "@/components/certificates/BadgeMedallion";
import { CheckCircle2, XCircle, Download, Share2, Linkedin, Loader2, ShieldCheck, Copy, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SITE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://www.safetyacademy.tech";

const ACADEMY_URL = "https://www.safetyacademy.tech";

const CERTIFICATE_SKILLS = [
  "Artificial Intelligence",
  "Digital Transformation",
  "SafetyTech",
  "AI Risk",
  "Compliance and Governance",
  "Leadership",
  "Change Management",
];

type Status = "loading" | "valid" | "revoked" | "notfound" | "search";

type LinkedInAssist = {
  title: string;
  detail: string;
  profileUrl?: string;
  composerUrl?: string;
  skills?: string;
  postText?: string;
  imageFileName?: string;
};

const VerifyCertificate = () => {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(certificateNumber ? "loading" : "search");
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [linkedinAssist, setLinkedinAssist] = useState<LinkedInAssist | null>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const verifyUrl = `${SITE_URL}/verify/${certificateNumber}`;
  const skillsText = CERTIFICATE_SKILLS.join(", ");

  const copyToClipboard = (text: string, successMessage: string) => {
    const write = navigator.clipboard?.writeText?.(text);
    if (!write) {
      toast.message("Copy this text", { description: text });
      return;
    }
    write.then(() => toast.success(successMessage)).catch(() => toast.message("Copy this text", { description: text }));
  };

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

  // Render the certificate to a high-resolution PNG. LinkedIn cannot attach a
  // file via URL, so we hand the user an actual image they can drop into the
  // post (a PNG attaches as a photo; a PDF would attach as a document).
  const downloadCertificateImage = async () => {
    if (!certRef.current) return null;
    try {
      toast.loading("Preparing your certificate image…", { id: "cert-img" });
      if (document.fonts?.ready) await document.fonts.ready;
      const node = certRef.current;
      const imgs = Array.from(node.querySelectorAll("img"));
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
      const imageFileName = `Safety4-Certificate-${cert?.certificate_number}.png`;
      const link = document.createElement("a");
      link.download = imageFileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Certificate image saved — attach it to your LinkedIn post", { id: "cert-img" });
      return imageFileName;
    } catch (e) {
      console.error(e);
      toast.error("Could not generate the certificate image", { id: "cert-img" });
      return null;
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
    const profileUrl = `https://www.linkedin.com/profile/add?${params.toString()}`;
    setLinkedinAssist({
      title: "Finish your LinkedIn licence",
      detail:
        "LinkedIn fills the certificate details from this page, but its public add-to-profile link does not support skills or media uploads. Copy the skills below, then use Add media to upload the certificate image if you want it shown on the credential.",
      profileUrl,
      skills: skillsText,
    });
    copyToClipboard(skillsText, "Skills copied — paste them into LinkedIn's Skills field");
    openInNewTab(profileUrl);
  };

  const linkedInSharePost = () => {
    if (!cert) return;
    const template =
      `I am excited to share that I have just completed the IOSH-approved ${cert.course_name} ` +
      `with the Safety 4.0 Academy (${ACADEMY_URL}). I am ready to lead safety forward!\n\n` +
      `Verify my certificate: ${verifyUrl}`;
    const composerUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(template)}`;
    setLinkedinAssist({
      title: "Finish your LinkedIn post",
      detail:
        "LinkedIn opens the post composer with your text, but does not allow websites to auto-upload images into personal posts. The certificate image is downloading now — attach it with Add media in the LinkedIn composer.",
      composerUrl,
      postText: template,
    });
    openInNewTab(composerUrl);
    void downloadCertificateImage().then((imageFileName) => {
      if (imageFileName) {
        setLinkedinAssist((current) => (current ? { ...current, imageFileName } : current));
      }
    });
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
            {/* Skills */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATE_SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

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

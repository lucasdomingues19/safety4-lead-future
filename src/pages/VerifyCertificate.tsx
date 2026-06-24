import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CertificateDocument, type CertificateData } from "@/components/certificates/CertificateDocument";
import { BadgeMedallion } from "@/components/certificates/BadgeMedallion";
import { CheckCircle2, XCircle, Download, Linkedin, Loader2, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ACADEMY_URL = "https://www.safetyacademy.tech";

const SITE_URL =
  typeof window !== "undefined" && window.location.hostname.endsWith("lovable.app")
    ? window.location.origin
    : ACADEMY_URL;

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

const VerifyCertificate = () => {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(certificateNumber ? "loading" : "search");
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [searchValue, setSearchValue] = useState("");
  
  const certRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const verifyUrl = `${SITE_URL}/verify/${certificateNumber}`;

  const trackInteraction = (event: "viewed" | "engaged" | "linkedin") => {
    if (!certificateNumber) return;
    void supabase.functions
      .invoke("track-certificate-interaction", {
        body: { certificateNumber, event },
      })
      .catch(() => {});
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
      trackInteraction("viewed");
    };
    lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateNumber]);

  const downloadCertificatePdf = async () => {
    if (!certRef.current) return;
    trackInteraction("engaged");
    try {
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
    } catch (e) {
      console.error(e);
    }
  };

  const downloadBadge = async () => {
    if (!badgeRef.current) return;
    trackInteraction("engaged");
    try {
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
    } catch (e) {
      console.error(e);
    }
  };

  const getLinkedInProfileUrl = () => {
    if (!cert) return "#";
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
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  const getLinkedInShareUrl = () => {
    if (!cert) return "#";
    const text = `I am excited to share I just completed the ${cert.course_name} by Safety 4.0 Academy and I am ready to Lead Safety Forward.\n\nVerify my certificate: ${verifyUrl}`;
    return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Certificate not found</h1>
        <p className="text-slate-500 max-w-md mb-6">
          We couldn't find a certificate with the number{" "}
          <span className="font-mono text-slate-900">{certificateNumber}</span>. Please check the number and try again.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (status === "search") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <ShieldCheck className="h-14 w-14 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify a certificate</h1>
        <p className="text-slate-500 max-w-md mb-6">
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
            className="flex-1 rounded-md border border-slate-200 bg-white px-4 py-2 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit">Verify</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
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
            <p className="font-semibold text-slate-900">
              {status === "valid" ? "Verified authentic certificate" : "This certificate has been revoked"}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
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
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATE_SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">Share &amp; download</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={downloadCertificatePdf}>
                <Download className="mr-2 h-4 w-4" /> Download certificate (PDF)
              </Button>
              <Button onClick={downloadBadge} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Download badge (PNG)
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-[#0a66c2] hover:bg-[#084a8f] text-white">
                <a href={getLinkedInShareUrl()} target="_top" onClick={() => trackInteraction("linkedin")}>
                  <Linkedin className="mr-2 h-4 w-4" /> Share on LinkedIn
                </a>
              </Button>
              <Button asChild className="bg-[#0a66c2] hover:bg-[#084a8f] text-white">
                <a href={getLinkedInProfileUrl()} target="_top" onClick={() => trackInteraction("linkedin")}>
                  <Linkedin className="mr-2 h-4 w-4" /> Add to LinkedIn profile
                </a>
              </Button>
            </div>
            <div className="pt-6 text-sm text-slate-500 space-y-1">
              <p><span className="text-slate-900 font-medium">Recipient:</span> {cert?.recipient_name}</p>
              <p><span className="text-slate-900 font-medium">Course:</span> {cert?.course_name}</p>
              <p>
                <span className="text-slate-900 font-medium">Issued:</span>{" "}
                {cert && new Date(cert.issued_at || cert.completion_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p>
                <span className="text-slate-900 font-medium">Completed:</span>{" "}
                {cert && new Date(cert.completion_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p><span className="text-slate-900 font-medium">Expires on:</span> Does not expire</p>
              {cert?.cpd_hours ? <p><span className="text-slate-900 font-medium">CPD Hours:</span> {cert.cpd_hours}</p> : null}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <BadgeMedallion ref={badgeRef} cert={cert!} size={260} />
            <p className="text-xs text-slate-500">Your shareable badge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Index from "./pages/Index";
const WhatsAppButton = lazy(() => import("./components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));
const ChatWidget = lazy(() => import("./components/ChatWidget").then(m => ({ default: m.ChatWidget })));
const GovernanceReadinessGate = lazy(() => import("./components/GovernanceReadinessGate"));

// Lazy load pages for better performance


const EBook = lazy(() => import("./pages/EBook"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const LinkedInCallback = lazy(() => import("./pages/LinkedInCallback"));

const NotFound = lazy(() => import("./pages/NotFound"));
const AntiPiracyPolicy = lazy(() => import("./pages/AntiPiracyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Scorecard = lazy(() => import("./pages/Scorecard"));
const Syllabus = lazy(() => import("./pages/Syllabus"));
const Offer = lazy(() => import("./pages/Offer"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Courses = lazy(() => import("./pages/Courses"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ForProfessionals = lazy(() => import("./pages/ForProfessionals"));

const Cohort = lazy(() => import("./pages/Cohort"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Enroll = lazy(() => import("./pages/Enroll"));
const AIFundamentals = lazy(() => import("./pages/AIFundamentals"));
const CopilotEHS = lazy(() => import("./pages/CopilotEHS"));
const GovernanceReadiness = lazy(() => import("./pages/GovernanceReadiness"));
const GuidesHub = lazy(() => import("./pages/Guides"));
const GuidePage = lazy(() => import("./pages/Guide"));
const ProposalPage = lazy(() => import("./pages/Proposal"));

// Learning platform (LMS)
const LearnAuth = lazy(() => import("./pages/learn/LearnAuth"));
const LearnDashboard = lazy(() => import("./pages/learn/LearnDashboard"));
const CourseView = lazy(() => import("./pages/learn/CourseView"));
const LessonView = lazy(() => import("./pages/learn/LessonView"));
const CourseManager = lazy(() => import("./pages/admin/CourseManager"));



// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// React Router keeps the browser's scroll position across client-side
// navigations by default, so clicking a link near the bottom of a page
// (e.g. a Related Courses card) lands on the new page still scrolled
// down. Reset to the top on every route change, unless the URL carries
// a hash — pages with their own hash-scroll behavior (e.g. #waitlist)
// handle that themselves.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

// Floating widgets/popups — hidden on private proposal pages
const GlobalWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/proposal")) return null;
  return (
    <Suspense fallback={null}>
      <WhatsAppButton />
      <GovernanceReadinessGate />
      <ChatWidget />
    </Suspense>
  );
};

const OldProposalRedirect = () => {
  const { token } = useParams<{ token: string }>();
  return <Navigate to={`/proposal_${token}`} replace />;
};

// React Router params must be a whole path segment, so `/proposal_:token`
// never matches. Match the single segment and parse the prefix ourselves.
const RESERVED_SLUGS = ['for-professionals', 'about-us', 'courses', 'contact', 'guides', 'learn', 'admin', 'privacy', 'terms', 'anti-piracy', 'blog', 'blog-page', 'faq'];

const ProposalSlugRoute = () => {
  const { slug } = useParams<{ slug: string }>();

  // Exclude reserved slugs from being treated as proposal slugs
  if (RESERVED_SLUGS.includes(slug || '')) {
    return <NotFound />;
  }

  if (slug?.startsWith("proposal_") && slug.length > "proposal_".length) {
    return <ProposalPage token={slug.slice("proposal_".length)} />;
  }
  return <NotFound />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/certification" element={<Navigate to="/elearning#accreditation" replace />} />
            <Route path="/ebook" element={<EBook />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/verify/:certificateNumber" element={<VerifyCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/linkedin-callback" element={<LinkedInCallback />} />
            
            <Route path="/anti-piracy-policy" element={<AntiPiracyPolicy />} />
            <Route path="/cookies-policy" element={<CookiesPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/scorecard" element={<Scorecard />} />
            <Route path="/assess-readiness" element={<Scorecard />} />
            <Route path="/elearning" element={<Syllabus />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/for-professionals" element={<ForProfessionals />} />
            <Route path="/teacher/lucas-domingues" element={<Navigate to="/about-us" replace />} />

            <Route path="/accelerator" element={<Cohort />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/enrol" element={<Enroll />} />
            <Route path="/ai-fundamentals" element={<AIFundamentals />} />
            <Route path="/copilot-for-ehs" element={<CopilotEHS />} />
            <Route path="/governance-readiness" element={<GovernanceReadiness />} />
            <Route path="/guides" element={<GuidesHub />} />
            <Route path="/guides/:slug" element={<GuidePage />} />
            <Route path="/proposal_:token" element={<ProposalPage />} />
            <Route path="/proposal/:token" element={<OldProposalRedirect />} />


            <Route path="/learn/auth" element={<LearnAuth />} />
            <Route path="/learn" element={<LearnDashboard />} />
            <Route path="/learn/:courseSlug" element={<CourseView />} />
            <Route path="/learn/:courseSlug/lesson/:lessonId" element={<LessonView />} />
            <Route path="/admin/courses" element={<CourseManager />} />

            {/* Catch-all route for proposal slugs - must be last before wildcard */}
            <Route path="/:slug" element={<ProposalSlugRoute />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
        <GlobalWidgets />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

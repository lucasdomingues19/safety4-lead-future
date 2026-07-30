import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
const WhatsAppButton = lazy(() => import("./components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));
const ChatWidget = lazy(() => import("./components/ChatWidget").then(m => ({ default: m.ChatWidget })));

// Lazy load pages for better performance


const Certification = lazy(() => import("./pages/Certification"));
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

const Cohort = lazy(() => import("./pages/Cohort"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Enroll = lazy(() => import("./pages/Enroll"));
const AIFundamentals = lazy(() => import("./pages/AIFundamentals"));

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/certification" element={<Certification />} />
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
            <Route path="/elearning" element={<Syllabus />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/pricing" element={<Pricing />} />
            
            <Route path="/accelerator" element={<Cohort />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/enrol" element={<Enroll />} />
            <Route path="/ai-fundamentals" element={<AIFundamentals />} />
            <Route path="/learn/auth" element={<LearnAuth />} />
            <Route path="/learn" element={<LearnDashboard />} />
            <Route path="/learn/:courseSlug" element={<CourseView />} />
            <Route path="/learn/:courseSlug/lesson/:lessonId" element={<LessonView />} />
            <Route path="/admin/courses" element={<CourseManager />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <WhatsAppButton />
          <ChatWidget />
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy load pages for better performance


const Certification = lazy(() => import("./pages/Certification"));
const EBook = lazy(() => import("./pages/EBook"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

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
const InCompany = lazy(() => import("./pages/InCompany"));
const Cohort = lazy(() => import("./pages/Cohort"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Enroll = lazy(() => import("./pages/Enroll"));

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
            <Route path="/about" element={<About />} />
            
            <Route path="/certification" element={<Certification />} />
            <Route path="/ebook" element={<EBook />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            <Route path="/anti-piracy-policy" element={<AntiPiracyPolicy />} />
            <Route path="/cookies-policy" element={<CookiesPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/scorecard" element={<Scorecard />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/enroll" element={<Offer />} />
            <Route path="/in-company" element={<InCompany />} />
            <Route path="/accelerator" element={<Cohort />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/enrol" element={<Enroll />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import React, { Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

// Lazy load below-fold components for faster initial load
const Features = lazy(() => import("@/components/Features"));
const ChatDemo = lazy(() => import("@/components/ChatDemo"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const CTA = lazy(() => import("@/components/CTA"));
const Footer = lazy(() => import("@/components/Footer"));

// Minimal loading placeholder
const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <>
      <Helmet>
        <title>IntelliPrep - AI-Powered Study Assistant for Exam Success</title>
        <meta 
          name="description" 
          content="AI-powered study assistant helping students understand concepts, solve problems, and ace their exams with instant, accurate answers 24/7." 
        />
        <meta name="keywords" content="AI tutor, study help, exam preparation, homework help, online learning" />
        <link rel="canonical" href="https://intelliprep.com/" />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "IntelliPrep",
            "description": "AI-powered study assistant helping students understand concepts and ace their exams",
            "url": "https://intelliprep.com",
            "applicationCategory": "EducationalApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Suspense fallback={<SectionLoader />}>
            <Features />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <ChatDemo />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <Testimonials />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <CTA />
          </Suspense>
        </main>
        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
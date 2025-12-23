import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ChatDemo from "@/components/ChatDemo";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>StudyBuddy AI - Your Smart Exam Preparation Assistant</title>
        <meta 
          name="description" 
          content="AI-powered study assistant helping students understand concepts, solve problems, and ace their exams with instant, accurate answers 24/7." 
        />
        <meta name="keywords" content="AI tutor, study help, exam preparation, homework help, online learning" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <ChatDemo />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;

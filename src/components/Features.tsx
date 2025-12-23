import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Clock, 
  BookCheck, 
  Lightbulb, 
  FileText, 
  TrendingUp 
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Instant Answers",
    description: "Get clear explanations for any topic or question in seconds. No more waiting for help.",
  },
  {
    icon: BookCheck,
    title: "Subject Expert",
    description: "From math to history, science to literature – get expert help across all subjects.",
  },
  {
    icon: Lightbulb,
    title: "Concept Clarity",
    description: "Understand complex topics with simplified explanations tailored to your level.",
  },
  {
    icon: FileText,
    title: "Practice Problems",
    description: "Generate practice questions and get step-by-step solutions to master any topic.",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Study at your own pace, any time of day or night. Your AI tutor never sleeps.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your learning journey and identify areas that need more attention.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative" id="features">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.05),transparent_60%)]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Everything You Need to
            <span className="gradient-text"> Excel</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful AI tools designed to make studying more effective and less stressful.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full hover:shadow-glow transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

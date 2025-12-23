import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Biology Major",
    avatar: "S",
    content: "This AI tutor helped me understand organic chemistry concepts I've struggled with for months. My grades improved significantly!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "High School Senior",
    avatar: "M",
    content: "I used StudyBuddy to prepare for my SATs. The instant explanations and practice questions were exactly what I needed.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Medical Student",
    avatar: "E",
    content: "Perfect for late-night study sessions when professors aren't available. It explains complex anatomy topics clearly and accurately.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 px-4 relative" id="testimonials">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Loved by <span className="gradient-text">Students</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            See what students are saying about their experience with our AI study assistant.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="glass-card rounded-2xl p-6 h-full relative group hover:shadow-glow transition-all duration-300">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const demoConversations = [
  {
    question: "Can you explain the Pythagorean theorem?",
    answer: "The Pythagorean theorem states that in a right triangle, the square of the hypotenuse (c) equals the sum of squares of the other two sides (a and b): a² + b² = c². For example, if a=3 and b=4, then c=5 because 9+16=25. This is fundamental in geometry and has countless real-world applications!",
  },
  {
    question: "What causes photosynthesis?",
    answer: "Photosynthesis is how plants convert sunlight into energy! Plants use chlorophyll (the green pigment) to capture light energy, then combine CO₂ from air and H₂O from soil to create glucose (sugar) for energy. The bonus? They release oxygen as a byproduct, which we breathe! 🌱",
  },
  {
    question: "Help me understand World War II's main causes",
    answer: "WWII (1939-1945) had several key causes: 1) Treaty of Versailles left Germany humiliated with harsh penalties, 2) Rise of fascism in Germany, Italy & Japan, 3) Global economic depression, 4) Policy of appeasement that allowed Hitler's expansion, and 5) Germany's invasion of Poland. These factors combined created the deadliest conflict in history.",
  },
];

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = async (question: string) => {
    setIsTyping(true);
    
    // Find matching demo or use default
    const demo = demoConversations.find(d => 
      question.toLowerCase().includes(d.question.toLowerCase().split(" ")[3]) ||
      question.toLowerCase().includes(d.question.toLowerCase().split(" ")[4])
    ) || demoConversations[currentDemo % demoConversations.length];
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsTyping(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: "assistant", content: demo.answer }
    ]);
    setCurrentDemo(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    await simulateResponse(input);
  };

  const handleQuickQuestion = async (question: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages(prev => [...prev, userMessage]);
    await simulateResponse(question);
  };

  return (
    <section className="py-24 px-4" id="demo">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Try It Now</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Ask <span className="gradient-text">Anything</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Experience how our AI can help you understand any topic. Try asking a question!
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-primary/5 border-b border-border px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">StudyBuddy AI</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">
                  Hi! I'm here to help you study. Ask me anything!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {demoConversations.map((demo, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(demo.question)}
                      className="text-sm px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {demo.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-border p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-secondary/50 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="icon" className="rounded-xl h-12 w-12" disabled={isTyping}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatDemo;

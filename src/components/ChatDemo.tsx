import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-chat`;

const suggestedQuestions = [
  "Explain the Pythagorean theorem",
  "What causes photosynthesis?",
  "Explain World War II's main causes",
];

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    setIsLoading(true);
    
    // Add empty assistant message that we'll update
    const assistantId = Date.now() + 1;
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Remove the empty assistant message
      setMessages(prev => prev.filter(m => m.id !== assistantId));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    
    await streamChat(newMessages);
  };

  const handleQuickQuestion = async (question: string) => {
    if (isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await streamChat(newMessages);
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
            Experience real AI-powered study help. Ask any question about any subject!
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
              <p className="text-xs text-muted-foreground">Powered by AI</p>
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
                  Hi! I'm your AI study buddy. Ask me anything about any subject!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      disabled={isLoading}
                      className="text-sm px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {question}
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content || (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Thinking...
                        </span>
                      )}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-border p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any study question..."
                disabled={isLoading}
                className="flex-1 bg-secondary/50 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <Button type="submit" size="icon" className="rounded-xl h-12 w-12" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatDemo;

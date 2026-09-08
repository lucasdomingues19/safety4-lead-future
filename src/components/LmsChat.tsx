import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LmsChatProps {
  userId?: string;
  userEmail?: string;
  userRole?: "student" | "admin" | "instructor";
  courseContext?: {
    courseId: string;
    courseName: string;
  };
  onClose?: () => void;
}

export const LmsChat = ({
  userId,
  userEmail,
  userRole = "student",
  courseContext,
  onClose,
}: LmsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi there! 👋 I'm your SafetyTech Academy learning assistant powered by Claude. I can help you with:\n\n• Questions about your courses and lessons\n• Learning recommendations\n• Account and enrollment info\n• Technical support\n• Course content explanations\n\nHow can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("lms-chat", {
        body: {
          message: input,
          userId,
          userEmail,
          userRole,
          courseContext,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          error instanceof Error
            ? `Error: ${error.message}`
            : "Sorry, I encountered an issue. Please try again or contact support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
          style={{ background: "#3434FF" }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl text-white"
        style={{ background: "#3434FF" }}
      >
        <div>
          <h3 className="font-bold">SafetyTech Assistant</h3>
          <p className="text-xs opacity-90">Powered by Claude</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
          >
            <span className="text-lg">−</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2.5 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-blue-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg rounded-bl-none px-4 py-3">
              <Loader2 className="w-4 h-4 text-slate-600 dark:text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-white disabled:opacity-50"
            style={{ background: "#3434FF" }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {courseContext
            ? `Focused on: ${courseContext.courseName}`
            : "Ask about your courses, progress, or get help"}
        </p>
      </form>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createInventoryAgent } from "@/src/lib/agent";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InventoryItem } from "@/src/lib/inventory";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  inventory: InventoryItem[];
}

export function ChatInterface({ inventory }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Inventory Agent. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const executor = await createInventoryAgent(inventory);
      const response = await executor.invoke({ input: userMessage });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.output }]);
    } catch (error: any) {
      console.error("Agent Error:", error);
      const errorMessage = error?.message || "I encountered an error while processing your request.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "Which items are low in stock?",
    "How many products are there?",
    "Predict demand"
  ];

  return (
    <Card className="flex flex-col h-[500px] md:h-[550px] w-full shadow-sm border-slate-200 overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
          <Bot className="h-4 w-4 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 bg-white">
        <ScrollArea className="h-full px-4 py-6" viewportRef={scrollRef}>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>
                      {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none shadow-sm' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center text-slate-400 text-xs font-medium">
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  Agent is thinking...
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 p-4 border-t bg-slate-50/30">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="ghost"
              size="sm"
              className="text-[11px] h-7 px-2.5 bg-white border border-slate-200 hover:bg-slate-100 hover:text-primary transition-colors rounded-full"
              onClick={() => {
                setInput(action);
              }}
            >
              <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
              {action}
            </Button>
          ))}
        </div>
        <div className="flex w-full gap-2 items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Ask a question..."
              className="pr-10 bg-white border-slate-200 focus-visible:ring-primary/20 h-10 rounded-xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono hidden sm:block">
              ⏎
            </div>
          </div>
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl shadow-md shadow-primary/10"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

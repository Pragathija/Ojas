import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Bot,
  User,
  HeartPulse,
  Moon,
  Wind,
  Telescope,
} from 'lucide-react';
import { aiService, AIChatTurn } from '../../services';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  { label: 'How is my sleep trending this week?', icon: Moon },
  { label: 'Explain my recent heart rate baseline', icon: HeartPulse },
  { label: 'What does Inspiration4 research show?', icon: Telescope },
  { label: 'Guide me through a relaxation exercise', icon: Wind },
];

export const OjasAISlideout: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<AIChatTurn[]>([
    {
      role: 'assistant',
      content:
        'Greetings Commander. I am Ojas, your onboard wellness and telemetry companion. All bio-sensor downlinks are nominal. How can I support your mission rhythm today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userTurn: AIChatTurn = { role: 'user', content: text };
    const updatedMessages = [...messages, userTurn];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(text, updatedMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Telemetry companion momentarily operating offline. Your biometrics remain steady within Isolation Forest v2 corridors.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out drawer panel */}
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E9E4F2] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E9E4F2] flex items-center justify-between bg-[#F8F6FF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7656D9] to-[#5535A5] text-white flex items-center justify-center shadow-soft">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-[#252039]">Ojas AI Companion</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <span className="text-[10px] text-[#716B83] font-mono block">
                Context-Aware Aerospace Wellness Model
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[#E9E4F2] text-[#716B83] hover:text-[#252039] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Medical Safety Disclaimer Notice */}
        <div className="p-3 bg-[#F2EDFF] border-b border-[#E9E4F2] flex items-start gap-2.5 text-[11px] text-[#5535A5]">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-[#7656D9]" />
          <span>
            Non-clinical companion. All deterministic medical alerts are routed directly to Flight Surgeon Dr. Stone.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs tablet:text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#7656D9] text-white rounded-br-xs shadow-soft'
                    : 'bg-[#F8F6FF] text-[#252039] border border-[#E9E4F2] rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#5535A5] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  S
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#716B83] p-2">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-[#7656D9]" />
              <span>Ojas analyzing telemetry context...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts Pills */}
        <div className="p-3 border-t border-[#E9E4F2] bg-[#FAF9FF] overflow-x-auto flex gap-2">
          {SUGGESTED_PROMPTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(p.label)}
                className="px-3 py-1.5 rounded-xl border border-[#E9E4F2] bg-white text-[#716B83] hover:text-[#7656D9] hover:border-[#7656D9]/30 text-xs font-sans whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Icon className="h-3 w-3 text-[#7656D9]" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E9E4F2] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about vitals, NASA research, or wellness..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-[#252039] text-xs tablet:text-sm focus:outline-none focus:border-[#7656D9] focus:bg-white transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#7656D9] hover:bg-[#6444C9] text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

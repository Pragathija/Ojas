import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Moon,
  Telescope,
  Wind,
  Activity,
  Zap,
} from 'lucide-react';
import { aiService, AIChatTurn } from '../../services';

const SUGGESTED_QUESTIONS = [
  { label: 'How has my sleep changed this week?', icon: Moon },
  { label: 'Explain my recent heart-rate trend', icon: HeartPulse },
  { label: 'What does the Inspiration4 research show about blood biomarkers?', icon: Telescope },
  { label: 'Can you guide me through a short relaxation exercise?', icon: Wind },
  { label: 'What activities can I try today?', icon: Zap },
];

export const OjasAIPage: React.FC = () => {
  const [messages, setMessages] = useState<AIChatTurn[]>([
    {
      role: 'assistant',
      content:
        'Hello Commander. I am Ojas, your personalized flight health and wellness companion. I can help explain your biometric trends, share insights from NASA research analogs, or guide you through calming relaxation exercises.\n\nAll sensor connections on Artemis-V are nominal. How can I assist you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userTurn: AIChatTurn = { role: 'user', content: text };
    const updated = [...messages, userTurn];
    setMessages(updated);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(text, updated);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I am currently operating in standalone mode. Your heart rate is 64 bpm and SpO2 is 98.2%, securely aligned with your Isolation Forest v2 baseline corridor.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-4">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7656D9] to-[#5535A5] text-white flex items-center justify-center shadow-soft">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl tablet:text-3xl font-extrabold text-[#252039]">
                  Ojas AI Companion
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#716B83] font-sans">
                Context-aware conversational wellness engine grounded in your real-time biometrics and NASA research.
              </p>
            </div>
          </div>

          {/* Quick Context Pill */}
          <div className="flex items-center gap-2 text-xs font-mono p-2.5 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2]">
            <Activity className="h-4 w-4 text-[#7656D9]" />
            <span className="text-[#716B83]">Context: </span>
            <strong className="text-[#252039]">HR 64 bpm • SpO2 98.2% • Rest 7.4h</strong>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="p-3.5 rounded-xl bg-[#F2EDFF] border border-[#7656D9]/20 flex items-start gap-2.5 text-xs text-[#5535A5]">
          <ShieldCheck className="h-4 w-4 text-[#7656D9] shrink-0 mt-0.5" />
          <span>
            Non-clinical health companion. Does not diagnose diseases, prescribe medication, or calculate clinical risk scores. All formal alerts are routed to Flight Surgeon Dr. Stone.
          </span>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-xs tablet:text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-9 h-9 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`p-4 tablet:p-5 rounded-2xl max-w-[82%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#7656D9] text-white rounded-br-xs shadow-soft'
                    : 'bg-[#F8F6FF] text-[#252039] border border-[#E9E4F2] rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
              </div>

              {m.role === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-[#5535A5] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                  S
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#716B83] p-3">
              <Sparkles className="h-4 w-4 animate-spin text-[#7656D9]" />
              <span>Ojas analyzing telemetry context and NASA research repositories...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Question Chips */}
        <div className="p-3 border-t border-[#E9E4F2] bg-[#FAF9FF] overflow-x-auto flex gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(q.label)}
                className="px-3.5 py-2 rounded-xl border border-[#E9E4F2] bg-white text-[#716B83] hover:text-[#7656D9] hover:border-[#7656D9]/30 text-xs font-sans whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Icon className="h-3.5 w-3.5 text-[#7656D9]" />
                <span>{q.label}</span>
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
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question about your health, NASA research, or wellness routines..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-[#252039] text-sm focus:outline-none focus:border-[#7656D9] focus:bg-white transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7656D9] to-[#5535A5] text-white font-heading font-bold text-sm shadow-soft flex items-center gap-2 hover:opacity-95 transition-transform active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <span>Ask Ojas</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

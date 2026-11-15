import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle, HelpCircle, RefreshCw, Database, KeyRound } from 'lucide-react';
import { Card, Badge, PageHeader } from '../components';
import { ChatMessage, AstronautProfile } from '../types';
import { latestFor } from '../assistant/loadRecords';
import { buildContext } from '../assistant/contextBuilder';
import { checkRedFlags, emergencyReply, onboardReply } from '../assistant/engine';
import { askAI } from '../assistant/aiClient';
import { SCENARIOS } from '../assistant/scenarios';
import { AssistantReply, Fact, Urgency, maxUrgency } from '../assistant/types';

interface AiAssistantProps {
  astronaut: AstronautProfile;
}

// Extends the shared ChatMessage locally so other pages are unaffected.
interface AssistantChatMessage extends ChatMessage {
  reply?: AssistantReply;
  flags?: string[];
  facts?: Fact[];
}

const CHIPS = [
  'My heart is beating faster and I feel dizzy',
  'I slept badly, what should I do?',
  'I have a headache',
  'Explain my latest readings',
  'I have chest pain and almost fainted',
];

const URGENCY_STYLE: Record<Urgency, { label: string; cls: string }> = {
  routine: { label: 'Routine', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  monitor: { label: 'Monitor', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  'contact-medical-team': { label: 'Contact medical team', cls: 'bg-red-50 text-red-700 border-red-200' },
};

const nowStamp = () => {
  const n = new Date();
  return `${n.getUTCHours().toString().padStart(2, '0')}:${n.getUTCMinutes().toString().padStart(2, '0')} UTC`;
};

const GREETING: AssistantChatMessage = {
  id: 'msg-greeting',
  sender: 'assistant',
  text: 'Hello. Tell me your symptoms or ask about your readings. I compare them with your personal baseline and cabin data. I give preliminary guidance only, not a diagnosis.',
  timestamp: nowStamp(),
};

export function AiAssistant({ astronaut }: AiAssistantProps) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([GREETING]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scenarioId, setScenarioId] = useState('live');
  // Key comes from a local .env file (VITE_GROQ_KEY, git-ignored). If absent, a paste box appears.
  const envKey: string = (import.meta.env.VITE_GROQ_KEY as string | undefined) ?? '';
  const [apiKey, setApiKey] = useState(envKey);
  const [lastFacts, setLastFacts] = useState<Fact[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Build the health context (latest CSV row + optional demo scenario override)
  const ctx = useMemo(() => {
    const { daily, cabin } = latestFor(astronaut.astronautId);
    const sc = SCENARIOS.find((s) => s.id === scenarioId);
    const d = daily ? { ...daily, ...(sc?.daily ?? {}) } : daily;
    const c = cabin ? { ...cabin, ...(sc?.cabin ?? {}) } : cabin;
    return buildContext(astronaut, d, c);
  }, [astronaut, scenarioId]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isTyping) return;
    const stamp = nowStamp();

    setMessages((prev) => [...prev, { id: `msg-user-${Date.now()}`, sender: 'user', text, timestamp: stamp }]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // 1. Rule-based red-flag check (offline, runs before any AI)
    const flags = checkRedFlags(text, ctx.latest, ctx.cabin);
    let reply: AssistantReply;

    if (flags.length) {
      reply = emergencyReply(flags, ctx);
    } else {
      // 2. On-board answer is always computed
      reply = onboardReply(text, ctx);
      // 3. Optional AI enhancement
      if (apiKey.trim()) {
        try {
          const ai = await askAI(apiKey.trim(), text, ctx.summary);
          // AI may raise urgency but never lower it below the rule-based result
          ai.urgency = maxUrgency(ai.urgency, reply.urgency);
          reply = ai;
        } catch {
          // keep the on-board reply
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    setLastFacts(ctx.facts);
    setMessages((prev) => [
      ...prev,
      { id: `msg-asst-${Date.now()}`, sender: 'assistant', text: '', timestamp: stamp, reply, flags, facts: ctx.facts },
    ]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const factsShown = lastFacts ?? ctx.facts;
  const worst = messages.reduce<Urgency | null>(
    (acc, m) => (m.reply ? (acc ? maxUrgency(acc, m.reply.urgency) : m.reply.urgency) : acc),
    null
  );

  return (
    <div className="space-y-6">
      <PageHeader
        category="Autonomous Flight Support"
        title="AI Medical Assistant"
        description="Report symptoms, ask health questions, and get preliminary guidance based on your health records."
        action={
          <div className="flex items-center space-x-2">
            <Badge variant="blue" size="md">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-600" />
              {apiKey.trim() ? 'AI enhanced (Earth link)' : 'On-board engine (offline)'}
            </Badge>
            <button
              onClick={() => {
                setMessages([GREETING]);
                setLastFacts(null);
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              title="Reset Conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat feed */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-subtle h-[620px]">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 flex items-center space-x-2">
                  <span>ASTRA Clinical Advisory Module</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Reading records for {astronaut.name} • rules run on-board, no network needed
                </div>
              </div>
            </div>
            {worst && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${URGENCY_STYLE[worst].cls}`}>
                Session: {URGENCY_STYLE[worst].label}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const r = msg.reply;
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-sm'
                        : 'bg-sky-600 text-white rounded-tr-sm shadow-xs'
                    }`}
                  >
                    {r ? (
                      <div className="space-y-3">
                        {r.urgency === 'contact-medical-team' && (
                          <div className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-3 py-2 font-semibold">
                            <AlertTriangle className="w-4 h-4" />
                            Contact the medical team now
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${URGENCY_STYLE[r.urgency].cls}`}>
                            Urgency: {URGENCY_STYLE[r.urgency].label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {r.source === 'ai' ? 'AI-enhanced answer' : 'On-board guide'}
                          </span>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 mb-1">Possible explanations</div>
                          <ul className="list-disc pl-4 space-y-1">
                            {r.explanations.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 mb-1">Recommended next steps</div>
                          <ul className="list-disc pl-4 space-y-1">
                            {r.next_steps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-[10px] text-slate-400">Preliminary guidance, not a diagnosis.</div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{msg.text}</div>
                    )}
                    <div className={`text-[10px] mt-2 flex items-center justify-end font-medium ${isAssistant ? 'text-slate-400' : 'text-sky-200'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 overflow-hidden">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-3 text-slate-400 text-xs py-1">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200/70 px-3 py-2 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 bg-slate-50/40 border-t border-slate-100 overflow-x-auto flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center">
              <HelpCircle className="w-3 h-3 mr-1 text-sky-600" />
              Suggested:
            </span>
            {CHIPS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-xs px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-md whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white rounded-b-xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a symptom or ask about your readings..."
                className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isTyping}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card title="Data used for this answer" subtitle="Records the assistant reads">
            <div className="space-y-1.5">
              {factsShown.length === 0 && <div className="text-xs text-slate-400">No records found.</div>}
              {factsShown.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-xs rounded-md px-2 py-1.5 ${
                    f.flagged ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Database className="w-3 h-3 mt-0.5 shrink-0 text-sky-600" />
                  <span>
                    <span className="font-semibold">{f.label}:</span> {f.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Demo scenario" subtitle="Override the latest readings to test">
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Card>

          {envKey ? null : (
            <Card title="AI enhancement (optional)" subtitle="Groq, needs an Earth link">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Groq key (gsk_...)"
                autoComplete="off"
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Kept in memory only and never saved. Without it, the on-board engine answers.
            </p>
          </Card>
          )}

          <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 text-amber-900">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-900">Medical Notice</h4>
                <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                  Preliminary guidance only. It does not replace diagnosis by mission flight surgeons. Guidance content is demo-grade and needs clinical review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

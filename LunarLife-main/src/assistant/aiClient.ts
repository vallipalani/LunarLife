// Optional AI enhancement using Groq (OpenAI-compatible API).
// The key is pasted into the UI and held in memory only
import { SYSTEM_PROMPT } from './systemPrompt';
import { AssistantReply, Urgency } from './types';

const VALID: Urgency[] = ['routine', 'monitor', 'contact-medical-team'];
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Groq's model catalog changes - check console.groq.com/docs/models if this stops working.
const MODEL = 'llama-3.3-70b-versatile';

export async function askAI(apiKey: string, message: string, contextSummary: string): Promise<AssistantReply> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `HEALTH CONTEXT:\n${contextSummary}\n\nMESSAGE:\n${message}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq call failed (${res.status})`);
  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';
  const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  const p = JSON.parse(json);
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
  return {
    explanations: arr(p.explanations),
    next_steps: arr(p.next_steps),
    urgency: VALID.includes(p.urgency) ? p.urgency : 'monitor',
    data_used: arr(p.data_used),
    source: 'ai',
  };
}

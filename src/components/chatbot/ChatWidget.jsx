import { useEffect, useMemo, useRef, useState } from 'react';
import { chat } from '../../api/endpoints.js';
import { useUI } from '../../store/ui.js';
import useRestaurant from '../../hooks/useRestaurant.js';

const SESSION_KEY = 'rss-chat-session-v1';
const MESSAGES_KEY = 'rss-chat-messages-v1';

const PLACEHOLDER = {
  auto: 'Type your message…',
  en: 'Type your message…',
  'ur-roman': 'Apna message likhein…',
  ur: 'اپنا پیغام لکھیں…',
};

const LABELS = {
  auto: 'Auto',
  en: 'EN',
  'ur-roman': 'Roman',
  ur: 'اردو',
};

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function ChatWidget() {
  const open = useUI((s) => s.chatOpen);
  const toggle = useUI((s) => s.toggleChat);
  const close = useUI((s) => s.closeChat);
  const { restaurant } = useRestaurant();

  const [locale, setLocale] = useState(() => loadStored(`${SESSION_KEY}:locale`, 'auto'));
  const [sessionId, setSessionId] = useState(() => loadStored(SESSION_KEY, null));
  const [messages, setMessages] = useState(() => loadStored(MESSAGES_KEY, []));
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Persist conversation across page reloads (for the multi-turn order flow).
  useEffect(() => { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-50))); }, [messages]);
  useEffect(() => { sessionId && localStorage.setItem(SESSION_KEY, JSON.stringify(sessionId)); }, [sessionId]);
  useEffect(() => { localStorage.setItem(`${SESSION_KEY}:locale`, JSON.stringify(locale)); }, [locale]);

  // Auto-scroll the transcript when messages change or panel opens.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, sending]);

  // Friendly first-time greeting.
  useEffect(() => {
    if (open && messages.length === 0 && restaurant) {
      setMessages([{ role: 'bot', text: `Hi! I'm the ${restaurant.name} assistant. Ask for the menu, prices, hours — or just say "1 biryani aur 1 coke".` }]);
    }
  }, [open, restaurant, messages.length]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;
    setError(null);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setSending(true);
    try {
      const res = await chat(trimmed, sessionId, locale);
      if (res.sessionId && res.sessionId !== sessionId) setSessionId(res.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: res.reply,
          intent: res.intent,
          locale: res.locale,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to send');
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ ' + (err.message || 'Something went wrong'), error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(MESSAGES_KEY);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const inputDir = locale === 'ur' ? 'rtl' : 'ltr';
  const placeholder = PLACEHOLDER[locale] || PLACEHOLDER.en;

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0 1 18 0c0 4.97-4.03 9-9 9-1.5 0-2.92-.37-4.16-1.02L3 21l1.07-4.84A8.96 8.96 0 0 1 3 12z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-30 flex h-[32rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">A</span>
              <div>
                <div className="text-sm font-semibold leading-tight">Chat with us</div>
                <div className="text-xs text-stone-500">English / اردو / Roman Urdu</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="rounded-md border border-stone-300 bg-white px-1.5 py-1 text-xs"
                aria-label="Language"
              >
                {Object.entries(LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={reset}
                className="rounded-md p-1 text-stone-500 hover:bg-stone-200"
                aria-label="Reset conversation"
                title="Reset"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0 0 14.5-3M19 5a9 9 0 0 0-14.5 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-1 text-stone-500 hover:bg-stone-200"
                aria-label="Close chat"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-stone-50 px-3 py-3">
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
            {sending && (
              <div className="flex">
                <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-stone-500 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="border-t border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">{error}</div>
          )}

          <div className="border-t border-stone-200 bg-white p-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                dir={inputDir}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`flex-1 resize-none rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${locale === 'ur' ? 'urdu' : ''}`}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || sending}
                className="btn-primary px-3"
                aria-label="Send"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l14-7-7 14-2-5-5-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ message }) {
  const isUser = message.role === 'user';
  // Detect Urdu glyphs to apply Nastaliq font + RTL even when bot reply uses ur locale.
  const hasUrdu = useMemo(() => /[؀-ۿ]/.test(message.text || ''), [message.text]);
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        dir={hasUrdu ? 'rtl' : 'ltr'}
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isUser ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-white text-stone-800'
        } ${hasUrdu ? 'urdu' : ''}`}
      >
        {message.text}
      </div>
    </div>
  );
}

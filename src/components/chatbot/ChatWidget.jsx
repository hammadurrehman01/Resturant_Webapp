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

  // Voice Chat (STT and TTS) State & Refs
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('rss-chat-voice-enabled');
      return stored !== 'false';
    } catch {
      return true;
    }
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const hasSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Persist conversation across page reloads (for the multi-turn order flow).
  useEffect(() => { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-50))); }, [messages]);
  useEffect(() => { sessionId && localStorage.setItem(SESSION_KEY, JSON.stringify(sessionId)); }, [sessionId]);
  useEffect(() => { localStorage.setItem(`${SESSION_KEY}:locale`, JSON.stringify(locale)); }, [locale]);

  useEffect(() => {
    try {
      localStorage.setItem('rss-chat-voice-enabled', String(voiceEnabled));
    } catch (_) {}
  }, [voiceEnabled]);

  // Cancel TTS if voice is disabled
  useEffect(() => {
    if (!voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [voiceEnabled]);

  // Clean up voice activities on close
  useEffect(() => {
    if (!open) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (isListening && recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  }, [open, isListening]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

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

  const speakText = (text, msgLocale) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    let cleanText = text
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/—/g, ' ')
      .trim();

    if (msgLocale === 'ur' || msgLocale === 'ur-roman') {
      cleanText = cleanText.replace(/\bPKR\b/gi, 'روپے');
    } else {
      cleanText = cleanText.replace(/\bPKR\b/gi, 'rupees');
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (msgLocale === 'ur' || msgLocale === 'ur-roman') {
      utterance.lang = 'ur-PK';
    } else {
      utterance.lang = 'en-US';
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      let voice = null;
      if (msgLocale === 'ur' || msgLocale === 'ur-roman') {
        voice = voices.find((v) => v.lang.startsWith('ur'));
        if (!voice) voice = voices.find((v) => v.lang.startsWith('hi'));
      } else {
        voice = voices.find((v) => v.lang.startsWith('en'));
      }
      if (voice) {
        utterance.voice = voice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

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
      if (voiceEnabled) {
        speakText(res.reply, res.locale || locale);
      }
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

  // Keep a stable ref to the send function for Speech Recognition callback
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const getSpeechLang = (loc) => {
    if (loc === 'ur' || loc === 'ur-roman') return 'ur-PK';
    return 'en-US';
  };

  // Speech Recognition instance setup
  useEffect(() => {
    if (!hasSpeech) return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript && transcript.trim()) {
        sendRef.current(transcript.trim());
      }
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setError('Speech recognition error: ' + e.error);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      rec.abort();
    };
  }, [locale, sessionId]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.lang = getSpeechLang(locale);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const reset = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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
                onClick={() => setVoiceEnabled((prev) => !prev)}
                className={`rounded-md p-1 transition ${voiceEnabled ? 'text-brand-600' : 'text-stone-400 hover:text-stone-600'}`}
                aria-label={voiceEnabled ? 'Mute' : 'Speak'}
                title={voiceEnabled ? 'Mute voice responses' : 'Speak voice responses'}
              >
                {voiceEnabled ? (
                  <svg className="h-4 w-4 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                )}
              </button>
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
            <style>{`
              @keyframes soundwave-bar {
                0%, 100% { height: 6px; }
                50% { height: 20px; }
              }
              .soundwave-bar-1 { animation: soundwave-bar 0.8s ease-in-out infinite; }
              .soundwave-bar-2 { animation: soundwave-bar 0.8s ease-in-out infinite 0.15s; }
              .soundwave-bar-3 { animation: soundwave-bar 0.8s ease-in-out infinite 0.3s; }
              .soundwave-bar-4 { animation: soundwave-bar 0.8s ease-in-out infinite 0.45s; }
            `}</style>
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  rows={1}
                  dir={inputDir}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDown}
                  placeholder={isListening ? (locale === 'ur' ? 'سن رہا ہوں...' : 'Listening...') : placeholder}
                  disabled={isListening}
                  className={`w-full resize-none rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${locale === 'ur' ? 'urdu' : ''} ${isListening ? 'bg-stone-50' : ''}`}
                />
                {isListening && (
                  <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
                    <span className="w-1 rounded-full bg-brand-600 soundwave-bar-1" />
                    <span className="w-1 rounded-full bg-brand-600 soundwave-bar-2" />
                    <span className="w-1 rounded-full bg-brand-600 soundwave-bar-3" />
                    <span className="w-1 rounded-full bg-brand-600 soundwave-bar-4" />
                  </div>
                )}
              </div>
              {hasSpeech && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md hover:bg-red-600'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  title={isListening ? 'Stop listening' : 'Speak message'}
                >
                  {isListening ? (
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="6" width="12" height="12" rx="1.5" />
                    </svg>
                  ) : (
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || sending || isListening}
                className="btn-primary h-9 shrink-0 px-3 flex items-center justify-center"
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

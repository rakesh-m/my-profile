import { useEffect, useRef, useState } from 'react';
import './Prajakt.css';
import flower from './images/prajakt.svg';
import { processText } from './correction';

// Feature-detect the browser Speech Recognition API.
const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

// iOS Safari's Web Speech API is unreliable; detect iOS so we can point users
// at the native keyboard dictation instead.
const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Mac; disambiguate by touch support.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

// Returns true if the text contains any Devanagari characters.
function hasDevanagari(text) {
  return /[\u0900-\u097F]/.test(text);
}

// Common Marathi suffixes/postpositions, offered as tappable chips since
// they're fiddly to get right via transliteration. `attach: true` suffixes
// bind directly onto the previous word (e.g. \u0918\u0930 + \u091A\u093E -> \u0918\u0930\u091A\u093E); the rest are
// separate postposition words that need a preceding space.
const SUFFIXES = [
  { label: '\u091A\u093E', attach: true },
  { label: '\u091A\u0940', attach: true },
  { label: '\u091A\u0947', attach: true },
  { label: '\u0932\u093E', attach: true },
  { label: '\u0924', attach: true },
  { label: '\u0939\u0940', attach: true },
  { label: '\u092E\u0927\u094D\u092F\u0947', attach: false },
  { label: '\u0938\u093E\u0920\u0940', attach: false },
  { label: '\u092A\u093E\u0938\u0942\u0928', attach: false },
  { label: '\u0938\u094B\u092C\u0924', attach: false },
  { label: '\u0928\u0902\u0924\u0930', attach: false },
];

export default function Prajakt() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Button label depends on the input script: Devanagari -> correct,
  // otherwise (Latin / empty) -> transliterate (the default).
  const mode = hasDevanagari(text) ? 'correct' : 'transliterate';
  const actionLabel = mode === 'correct' ? 'Correct' : 'Transliterate';

  // Auto-grow the input: single line by default, expands as content wraps.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  // Set up speech recognition once.
  useEffect(() => {
    if (!SpeechRecognition) return undefined;
    const recognition = new SpeechRecognition();
    recognition.lang = 'mr-IN';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim();
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch (e) {
        /* no-op */
      }
    };
  }, []);

  const toggleMic = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      setError('');
      try {
        recognition.start();
        setListening(true);
      } catch (e) {
        /* start() throws if already started; ignore. */
      }
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError('');
    setOutput('');
    setCopied(false);
    try {
      const result = await processText(trimmed);
      setOutput(result);
    } catch (e) {
      setError('Could not process the text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuffixClick = ({ label, attach }) => {
    setText((prev) => {
      if (!prev || attach || /\s$/.test(prev)) return `${prev}${label}`;
      return `${prev} ${label}`;
    });
    // Keep focus and caret at the end so chips can be chained.
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
  };

  const handleClear = () => {
    setText('');
    setOutput('');
    setError('');
    setCopied(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard may be unavailable */
    }
  };

  const showMic = SpeechRecognition && !isIOS;

  return (
    <div className="prajakt">
      <header className="prajakt-header">
        <AnimatedWordmark />
        <img className="prajakt-logo" src={flower} alt="Prajakt flower" />
      </header>

      <main className="prajakt-main">
        <p className="prajakt-tagline">
          Type Marathi in English and Prajakt turns it into Devanagari — or tidies
          up Marathi you already have.
        </p>

        <div className="input-wrap">
          <textarea
            ref={inputRef}
            className="prajakt-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter submits; Shift+Enter inserts a newline.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="maza nav Rakesh ahe…"
            rows={1}
            dir="auto"
          />
          {text && (
            <button
              className="clear-btn"
              onClick={handleClear}
              title="Clear text"
              aria-label="Clear text"
            >
              ✕
            </button>
          )}
        </div>

        <div className="suffix-chips">
          {SUFFIXES.map((suffix) => (
            <button
              key={suffix.label}
              type="button"
              className="suffix-chip"
              onClick={() => handleSuffixClick(suffix)}
              aria-label={`Add suffix ${suffix.label}`}
            >
              {suffix.label}
            </button>
          ))}
        </div>

        <div className="prajakt-controls">
          {showMic && (
            <button
              className={`mic-btn${listening ? ' listening' : ''}`}
              onClick={toggleMic}
              title={listening ? 'Stop listening' : 'Speak in Marathi'}
              aria-label="Toggle microphone"
            >
              <MicIcon />
              {listening ? 'Listening…' : 'Speak'}
            </button>
          )}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
          >
            {loading ? '…' : actionLabel}
          </button>
        </div>

        {isIOS && (
          <p className="prajakt-hint">
            On iPhone, tap the mic on your keyboard to dictate into the box.
          </p>
        )}
        {!SpeechRecognition && !isIOS && (
          <p className="prajakt-hint">
            Voice input isn't supported in this browser. Try Chrome for the mic.
          </p>
        )}

        {error && <p className="prajakt-error">{error}</p>}

        {output && (
          <div className="output-card">
            <p className="output-text" dir="auto">
              {output}
            </p>
            <button
              className={`copy-icon-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy'}
              aria-label="Copy result"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        )}
      </main>

      <footer className="prajakt-footer">
        प्राजक्त — Marathi transliteration, made simple.
      </footer>
    </div>
  );
}

// Animated wordmark: types "prajakt", backspaces, then types "प्राजक्त".
// Replays the full sequence every 60 seconds.
function AnimatedWordmark() {
  const EN = 'prajakt';
  const MR = 'प्राजक्त';
  // English is the persisted resting state.
  const [display, setDisplay] = useState(EN);
  const timers = useRef([]);

  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    const push = (fn, delay) => {
      timers.current.push(setTimeout(fn, delay));
    };

    // One cycle: from English, backspace, type Marathi, pause, backspace,
    // retype English — so it always settles back on "prajakt".
    const runSequence = () => {
      clearTimers();
      let t = 0;
      const step = 110; // ms per character
      const mrChars = Array.from(MR);

      // Backspace "prajakt" to empty
      for (let i = EN.length - 1; i >= 0; i -= 1) {
        push(() => setDisplay(EN.slice(0, i)), t);
        t += step;
      }
      // Pause, then type "प्राजक्त"
      t += 300;
      for (let i = 1; i <= mrChars.length; i += 1) {
        push(() => setDisplay(mrChars.slice(0, i).join('')), t);
        t += step;
      }
      // Hold Marathi, then backspace to empty
      t += 900;
      for (let i = mrChars.length - 1; i >= 0; i -= 1) {
        push(() => setDisplay(mrChars.slice(0, i).join('')), t);
        t += step;
      }
      // Pause, then retype "prajakt" and rest there
      t += 300;
      for (let i = 1; i <= EN.length; i += 1) {
        push(() => setDisplay(EN.slice(0, i)), t);
        t += step;
      }
    };

    const interval = setInterval(runSequence, 60000);
    return () => {
      clearInterval(interval);
      clearTimers();
    };
  }, []);

  return (
    <span className="prajakt-title">
      <span className="prajakt-word">
        {display}
        <span className="cursor" aria-hidden="true" />
      </span>
    </span>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
      <path d="M19 12a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 0 0 2 0v-2.08A7 7 0 0 0 19 12z" />
    </svg>
  );
}

// Two overlapping sheets of paper — the familiar "copy" glyph.
function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

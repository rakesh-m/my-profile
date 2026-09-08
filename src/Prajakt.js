import { useEffect, useRef, useState } from 'react';
import './Prajakt.css';
import flower from './images/prajakt.svg';
import { correctMarathi } from './correction';

// Feature-detect the browser Speech Recognition API.
const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function Prajakt() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);

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
      // Append to any existing text so multiple dictations accumulate.
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
        // start() throws if already started; ignore.
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
      const corrected = await correctMarathi(trimmed);
      setOutput(corrected);
    } catch (e) {
      setError('Could not process the text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setOutput('');
    setError('');
    setCopied(false);
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

  return (
    <div className="prajakt">
      <header className="prajakt-header">
        <img className="prajakt-logo" src={flower} alt="Prajakt flower" />
        <span className="prajakt-title">Prajakt</span>
      </header>

      <main className="prajakt-main">
        <p className="prajakt-tagline">
          Speak or type Marathi, and Prajakt will tidy up the spelling and spacing.
        </p>

        <div className="input-wrap">
          <textarea
            className="prajakt-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="इथे मराठी मजकूर लिहा किंवा माइक वापरून बोला…"
            rows={5}
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

        <div className="prajakt-controls">
          {SpeechRecognition && (
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
            {loading ? 'Correcting…' : 'Correct'}
          </button>
        </div>

        {!SpeechRecognition && (
          <p className="prajakt-hint">
            Voice input isn't supported in this browser. Try Chrome for the mic.
          </p>
        )}

        {error && <p className="prajakt-error">{error}</p>}

        {output && (
          <div className="output-card">
            <div className="output-head">
              <span>Corrected</span>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="output-text" dir="auto">
              {output}
            </p>
          </div>
        )}
      </main>

      <footer className="prajakt-footer">
        A little helper for cleaner Marathi text.
      </footer>
    </div>
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

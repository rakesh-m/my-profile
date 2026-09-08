// Fast Marathi transliteration via Google Input Tools (the engine family behind
// Gboard's transliteration). The endpoint does not send CORS headers, so we
// call it with JSONP (a <script> tag with a &cb= callback), which is not
// subject to the browser's CORS policy. This keeps everything client-side.

const ENDPOINT = 'https://inputtools.google.com/request';

let callbackSeq = 0;

// Transliterates a single chunk of romanized Marathi to Devanagari, returning
// the top candidate. Resolves to null on failure/timeout so the caller can
// fall back to the model.
function transliterateChunk(chunk) {
  return new Promise((resolve) => {
    const cbName = `__prajakt_it_cb_${Date.now()}_${callbackSeq++}`;
    const script = document.createElement('script');
    let done = false;

    const cleanup = () => {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      resolve(value);
    };

    window[cbName] = (data) => {
      // Shape: ["SUCCESS",[[input,[cand1,cand2,...],...]]]
      try {
        if (
          Array.isArray(data) &&
          data[0] === 'SUCCESS' &&
          data[1] &&
          data[1][0] &&
          data[1][0][1] &&
          data[1][0][1][0]
        ) {
          finish(data[1][0][1][0]);
          return;
        }
      } catch (e) {
        /* fall through */
      }
      finish(null);
    };

    const timer = setTimeout(() => finish(null), 6000);

    const params = new URLSearchParams({
      text: chunk,
      itc: 'mr-t-i0-und',
      num: '1',
      cp: '0',
      cs: '1',
      ie: 'utf-8',
      oe: 'utf-8',
      cb: cbName,
    });
    script.src = `${ENDPOINT}?${params.toString()}`;
    script.onerror = () => finish(null);
    document.head.appendChild(script);
  });
}

// Transliterates romanized Marathi text to Devanagari. Splits on line breaks so
// newlines are preserved; each line is sent as one request. Returns null if any
// chunk fails, so the caller can fall back to the model.
export async function transliterateRomanized(text) {
  const lines = text.split('\n');
  const results = await Promise.all(
    lines.map((line) => (line.trim() ? transliterateChunk(line) : Promise.resolve('')))
  );
  if (results.some((r) => r === null)) return null;
  return results.join('\n');
}

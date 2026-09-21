/**
 * Multi-provider instant automatic translation engine
 * Supports Google Translate (free instant tier + official API key), DeepL, or local heuristics.
 */

interface TranslateOptions {
  from?: string; // 'fr' | 'ar' | 'en' | 'auto'
  to: string;    // 'fr' | 'ar' | 'en'
}

/**
 * Translates a single text string
 */
export async function translateText(
  text: string,
  options: TranslateOptions
): Promise<{ text: string; from: string; to: string }> {
  const from = options.from || 'auto';
  const to = options.to;

  if (!text || !text.trim()) {
    return { text: '', from, to };
  }

  // If source and destination are the same, return as is
  if (from !== 'auto' && from.toLowerCase() === to.toLowerCase()) {
    return { text, from, to };
  }

  // 1. Check if official Google Cloud API Key is configured
  const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (googleApiKey) {
    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: from === 'auto' ? undefined : from,
            target: to,
            format: 'text',
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const translated = data?.data?.translations?.[0]?.translatedText;
        if (translated) {
          return { text: translated, from, to };
        }
      }
    } catch (err) {
      console.warn('Google Cloud Translation API error, falling back to public engine:', err);
    }
  }

  // 2. Check if DeepL API Key is configured (DeepL supports FR, EN; Arabic support depends on plan)
  const deeplApiKey = process.env.DEEPL_API_KEY;
  if (deeplApiKey && to !== 'ar') {
    try {
      const res = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: [text],
          target_lang: to.toUpperCase(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const translated = data?.translations?.[0]?.text;
        if (translated) {
          return { text: translated, from, to };
        }
      }
    } catch (err) {
      console.warn('DeepL API error, falling back:', err);
    }
  }

  // 3. Instant Public Translation Engine (Zero-Config, Free, High-Accuracy Google Engine)
  try {
    const sl = from === 'auto' ? 'auto' : from.toLowerCase();
    const tl = to.toLowerCase();
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        // Concatenate all sentence segments
        const resultText = data[0]
          .map((item: any) => (item && item[0] ? item[0] : ''))
          .join('');

        if (resultText && resultText.trim()) {
          const detectedSource = data[2] || from;
          return { text: resultText, from: detectedSource, to };
        }
      }
    }
  } catch (err) {
    console.error('Instant translation engine error:', err);
  }

  // Fallback: return original text if translation failed
  return { text, from, to };
}

/**
 * Translates an object of key-value pairs (e.g. { title: '...', subtitle: '...' })
 */
export async function translateBatch(
  fields: Record<string, string>,
  options: TranslateOptions
): Promise<Record<string, string>> {
  const keys = Object.keys(fields);
  const results: Record<string, string> = {};

  // Run translations in parallel
  await Promise.all(
    keys.map(async (key) => {
      const val = fields[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        const res = await translateText(val, options);
        results[key] = res.text;
      } else {
        results[key] = val;
      }
    })
  );

  return results;
}

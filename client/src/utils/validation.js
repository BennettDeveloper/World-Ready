const KEYBOARD_RUNS = /qwerty|qwert|asdfg|asdf|zxcvb|zxcv|hjkl|yuiop|poiuy|lkjh/i;

export function isGibberish(text) {
  const t = text.trim().toLowerCase();
  if (t.length === 0) return true;
  if (t.length < 4) return true;

  const letters = (t.match(/[a-z]/g) || []).length;
  const total = t.replace(/\s/g, '').length;

  // Less than 60% letters → gibberish
  if (total > 0 && letters / total < 0.6) return true;

  // Keyboard smash patterns
  if (KEYBOARD_RUNS.test(t)) return true;

  // Repeated character runs (5+ same char)
  if (/(.)\1{4,}/.test(t)) return true;

  // Check each word independently
  const words = t.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return true;

  let gibberishWords = 0;
  for (const word of words) {
    if (word.length <= 2) continue;
    const wLetters = (word.match(/[a-z]/g) || []).length;
    const wVowels = (word.match(/[aeiou]/g) || []).length;
    // Word has no vowels and is longer than 3 chars → likely gibberish
    if (wLetters > 3 && wVowels === 0) gibberishWords++;
  }

  const longWords = words.filter(w => w.length > 3);
  if (longWords.length > 0 && gibberishWords / longWords.length > 0.6) return true;

  return false;
}

export function isValidJobTitle(text) {
  const t = text.trim();
  if (t.length < 2) return false;
  // Only letters, spaces, hyphens, slashes, periods, ampersands, numbers (for things like "Level 2 Analyst")
  if (!/^[a-zA-Z0-9\s\-\/\.\&\+]+$/.test(t)) return false;
  // Must have at least one vowel (real words)
  if (!/[aeiouAEIOU]/.test(t)) return false;
  return true;
}

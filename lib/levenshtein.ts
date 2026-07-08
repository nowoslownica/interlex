export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
      }
    }
  }
  return dp[m][n];
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'e', 'ж': 'ž', 'з': 'z', 'и': 'i',
  'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'č',
  'ш': 'š', 'щ': 'št', 'ъ': '', 'ы': 'y', 'ь': '',
  'э': 'e', 'ю': 'ju', 'я': 'ja',
  'і': 'i', 'ї': 'ji', 'є': 'je', 'ґ': 'g',
  'ў': 'u', 'џ': 'dž', 'ѓ': 'g', 'ѕ': 'dz',
  'ѝ': 'i', 'ћ': 'ć', 'ѐ': 'e',
};

const LATIN_DIACRITICS: Record<string, string> = {
  'č': 'c', 'ć': 'c', 'ç': 'c', 'ĉ': 'c', 'ċ': 'c',
  'š': 's', 'ś': 's', 'ş': 's', 'ŝ': 's',
  'ž': 'z', 'ź': 'z', 'ż': 'z',
  'đ': 'd', 'ď': 'd', 'ð': 'd',
  'ě': 'e', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'ę': 'e', 'ė': 'e', 'ē': 'e',
  'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'ą': 'a', 'ā': 'a', 'ă': 'a',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i', 'į': 'i', 'ī': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ō': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ų': 'u', 'ū': 'u', 'ů': 'u',
  'ý': 'y', 'ÿ': 'y', 'ỳ': 'y',
  'ń': 'n', 'ň': 'n', 'ñ': 'n',
  'ť': 't', 'ţ': 't',
  'ř': 'r', 'ŕ': 'r',
  'ľ': 'l', 'ĺ': 'l', 'ł': 'l',
  'ģ': 'g', 'ğ': 'g',
  'ķ': 'k',
  'ĥ': 'h',
  'ß': 'ss',
};

export function transliterateToLatin(text: string): string {
  let result = '';
  for (const ch of text.toLowerCase()) {
    result += CYRILLIC_TO_LATIN[ch] || ch;
  }
  return result;
}

export function stripLatinDiacritics(text: string): string {
  let result = '';
  for (const ch of text.toLowerCase()) {
    result += LATIN_DIACRITICS[ch] || ch;
  }
  return result;
}

export function toSimpleLatin(text: string): string {
  const latin = transliterateToLatin(text);
  return stripLatinDiacritics(latin).trim().replace(/\s+/g, ' ');
}

export function normalizeText(text: string): string {
  return transliterateToLatin(text).trim().replace(/\s+/g, ' ');
}

export function splitTranslations(values: string[]): string[] {
  const result: string[] = [];
  for (const v of values) {
    if (!v) continue;
    for (const part of v.split(',')) {
      const trimmed = part.trim();
      if (trimmed) result.push(normalizeText(trimmed));
    }
  }
  return result;
}

export function computePairwiseSimilarity(words: string[]): number {
  const normalized = splitTranslations(words);
  if (normalized.length < 2) return 0;

  let totalDist = 0;
  let maxDist = 0;
  let pairs = 0;

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const dist = levenshtein(normalized[i], normalized[j]);
      totalDist += dist;
      if (dist > maxDist) maxDist = dist;
      pairs++;
    }
  }

  if (maxDist === 0) return 1;
  const avgDist = totalDist / pairs;
  return 1 - avgDist / maxDist;
}

export function computeLanguageSimilarity(
  targetValue: string,
  otherValues: string[],
): number {
  const target = normalizeText(targetValue);
  if (!target || otherValues.length === 0) return 0;

  const others = splitTranslations(otherValues);
  if (others.length === 0) return 0;

  let totalDist = 0;
  let maxLen = target.length;

  for (const other of others) {
    const dist = levenshtein(target, other);
    totalDist += dist;
    if (other.length > maxLen) maxLen = other.length;
  }

  const avgDist = totalDist / others.length;
  if (maxLen === 0) return 0;
  const similarity = 1 - avgDist / maxLen;
  return Math.max(0, Math.min(1, similarity));
}

const SLAVIC_LANG_CODES = [
  'ru', 'uk', 'be', 'pl', 'cs', 'sk', 'sl', 'hr', 'sr', 'mk', 'bg',
] as const;

export function buildIntelligibilityString(
  isvWord: string,
  langMap: Record<string, string>,
): string {
  const normalizedIsv = toSimpleLatin(isvWord);
  if (!normalizedIsv) return '';

  const available = SLAVIC_LANG_CODES.filter(code => langMap[code]);

  const parts: string[] = [];
  for (const code of available) {
    const translation = toSimpleLatin(langMap[code]);
    if (!translation) continue;

    const maxLen = Math.max(normalizedIsv.length, translation.length);
    if (maxLen === 0) continue;

    const dist = levenshtein(normalizedIsv, translation);
    const similarity = 1 - dist / maxLen;

    const mark = similarity >= 0.6 ? '+' : similarity >= 0.35 ? '~' : '-';
    parts.push(`${code}${mark}`);
  }

  return parts.join(' ');
}
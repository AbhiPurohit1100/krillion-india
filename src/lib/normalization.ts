/**
 * Text Normalization Engine
 * Handles lowercasing, unicode normalization, diacritic stripping,
 * repeated whitespace collapse, and common punctuation removal.
 */
export function normalizeAnswer(text: string): string {
  if (!text) return "";

  return text
    // 1. Unicode decomposition (separates base characters from diacritics/accents)
    .normalize("NFKD")
    // 2. Remove combining diacritical marks
    .replace(/[\u0300-\u036f]/g, "")
    // 3. Convert to lowercase
    .toLowerCase()
    // 4. Remove common honorifics and noise words (e.g., "shri", "dr", "the")
    .replace(/\b(shri|sri|dr|the|mr|mrs)\b\.?/gi, "")
    // 5. Replace punctuation, hyphens, underscores with spaces
    .replace(/['’`".,\-_\/\\:;!?()\[\]{}]/g, " ")
    // 6. Collapse multiple whitespace characters into a single space
    .replace(/\s+/g, " ")
    // 7. Strip leading and trailing whitespace
    .trim();
}


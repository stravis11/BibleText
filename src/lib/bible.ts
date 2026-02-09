/**
 * Bible API Integration
 * Uses bible-api.com (free, no API key needed)
 * Note: Only public domain translations available
 */

// Available translations from bible-api.com
export const BIBLE_VERSIONS: Record<string, { id: string; name: string; language: string }> = {
  // English
  'KJV': { id: 'kjv', name: 'King James Version', language: 'en' },
  'WEB': { id: 'web', name: 'World English Bible', language: 'en' },
  'ASV': { id: 'asv', name: 'American Standard Version', language: 'en' },
  'BBE': { id: 'bbe', name: 'Bible in Basic English', language: 'en' },
  'DRA': { id: 'dra', name: 'Douay-Rheims', language: 'en' },
  'OEB': { id: 'oeb-us', name: 'Open English Bible', language: 'en' },
  // Portuguese
  'ALMEIDA': { id: 'almeida', name: 'João Ferreira de Almeida', language: 'pt' },
  // Chinese
  'CUV': { id: 'cuv', name: 'Chinese Union Version', language: 'zh' },
  // Russian
  'SYNODAL': { id: 'synodal', name: 'Russian Synodal', language: 'ru' },
  // Romanian
  'RCCV': { id: 'rccv', name: 'Cornilescu', language: 'ro' },
};

export const LANGUAGES = [
  { code: 'en', name: 'English', versions: ['KJV', 'WEB', 'ASV', 'BBE', 'DRA', 'OEB'] },
  { code: 'pt', name: 'Portuguese', versions: ['ALMEIDA'] },
  // Note: Chinese/Russian/Romanian have data gaps in bible-api.com
  // Uncomment when a better API is available
  // { code: 'zh', name: 'Chinese', versions: ['CUV'] },
  // { code: 'ru', name: 'Russian', versions: ['SYNODAL'] },
  // { code: 'ro', name: 'Romanian', versions: ['RCCV'] },
];

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  // Note: Hourly requires Vercel Pro plan for more frequent crons
];

// Popular Bible verses for random selection
// Format: { book: OSIS book ID, chapter: number, startVerse: number, endVerse?: number }
export const VERSE_POOL = [
  { book: 'JHN', chapter: 3, startVerse: 16 },
  { book: 'PSA', chapter: 23, startVerse: 1, endVerse: 6 },
  { book: 'ROM', chapter: 8, startVerse: 28 },
  { book: 'PHP', chapter: 4, startVerse: 13 },
  { book: 'ISA', chapter: 40, startVerse: 31 },
  { book: 'JER', chapter: 29, startVerse: 11 },
  { book: 'PRO', chapter: 3, startVerse: 5, endVerse: 6 },
  { book: 'ROM', chapter: 12, startVerse: 2 },
  { book: 'GAL', chapter: 5, startVerse: 22, endVerse: 23 },
  { book: 'HEB', chapter: 11, startVerse: 1 },
  { book: 'JOS', chapter: 1, startVerse: 9 },
  { book: 'PSA', chapter: 46, startVerse: 10 },
  { book: 'MAT', chapter: 11, startVerse: 28, endVerse: 30 },
  { book: 'ROM', chapter: 5, startVerse: 8 },
  { book: '2CO', chapter: 5, startVerse: 17 },
  { book: 'EPH', chapter: 2, startVerse: 8, endVerse: 9 },
  { book: 'PHP', chapter: 4, startVerse: 6, endVerse: 7 },
  { book: 'PSA', chapter: 119, startVerse: 105 },
  { book: '1CO', chapter: 13, startVerse: 4, endVerse: 7 },
  { book: 'ROM', chapter: 8, startVerse: 38, endVerse: 39 },
  { book: 'ISA', chapter: 41, startVerse: 10 },
  { book: 'MAT', chapter: 6, startVerse: 33 },
  { book: 'PSA', chapter: 37, startVerse: 4 },
  { book: 'PRO', chapter: 22, startVerse: 6 },
  { book: 'COL', chapter: 3, startVerse: 23 },
  { book: 'HEB', chapter: 12, startVerse: 1, endVerse: 2 },
  { book: '1PE', chapter: 5, startVerse: 7 },
  { book: 'MAT', chapter: 28, startVerse: 19, endVerse: 20 },
  { book: 'DEU', chapter: 31, startVerse: 6 },
  { book: 'PSA', chapter: 91, startVerse: 1, endVerse: 2 },
  { book: 'JHN', chapter: 14, startVerse: 6 },
  { book: 'JHN', chapter: 1, startVerse: 1 },
  { book: 'GEN', chapter: 1, startVerse: 1 },
  { book: 'ROM', chapter: 3, startVerse: 23 },
  { book: 'EPH', chapter: 6, startVerse: 10, endVerse: 11 },
  { book: 'PSA', chapter: 27, startVerse: 1 },
  { book: 'ISA', chapter: 53, startVerse: 5 },
  { book: 'MAT', chapter: 5, startVerse: 16 },
  { book: 'JAS', chapter: 1, startVerse: 2, endVerse: 4 },
  { book: '2TI', chapter: 1, startVerse: 7 },
];

// Book name mappings for display
const BOOK_NAMES: Record<string, string> = {
  'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers',
  'DEU': 'Deuteronomy', 'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth',
  '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
  '1CH': '1 Chronicles', '2CH': '2 Chronicles', 'EZR': 'Ezra', 'NEH': 'Nehemiah',
  'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms', 'PRO': 'Proverbs',
  'ECC': 'Ecclesiastes', 'SNG': 'Song of Solomon', 'ISA': 'Isaiah', 'JER': 'Jeremiah',
  'LAM': 'Lamentations', 'EZK': 'Ezekiel', 'DAN': 'Daniel', 'HOS': 'Hosea',
  'JOL': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah', 'JON': 'Jonah',
  'MIC': 'Micah', 'NAH': 'Nahum', 'HAB': 'Habakkuk', 'ZEP': 'Zephaniah',
  'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi',
  'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John',
  'ACT': 'Acts', 'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
  'GAL': 'Galatians', 'EPH': 'Ephesians', 'PHP': 'Philippians', 'COL': 'Colossians',
  '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy', '2TI': '2 Timothy',
  'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews', 'JAS': 'James',
  '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John',
  '3JN': '3 John', 'JUD': 'Jude', 'REV': 'Revelation',
};

/**
 * Get a random verse reference from the pool
 */
export function getRandomVerseRef(): { book: string; chapter: number; startVerse: number; endVerse?: number } {
  return VERSE_POOL[Math.floor(Math.random() * VERSE_POOL.length)];
}

/**
 * Fetch a Bible verse using the parameterized API (works for all translations)
 */
export async function fetchVerse(
  book: string, 
  chapter: number, 
  startVerse: number, 
  endVerse?: number, 
  version: string = 'KJV'
): Promise<{
  reference: string;
  text: string;
  version: string;
} | null> {
  try {
    const versionInfo = BIBLE_VERSIONS[version];
    const translationId = versionInfo?.id || 'kjv';
    
    // Use the parameterized API: /data/{translation}/{book}/{chapter}
    const url = `https://bible-api.com/data/${translationId}/${book}/${chapter}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      console.error(`Bible API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.verses || data.verses.length === 0) {
      console.error('No verses in response:', data);
      return null;
    }
    
    // Get the book name from the API response (localized)
    const bookName = data.verses[0]?.book || BOOK_NAMES[book] || book;
    
    // Extract the requested verses
    const end = endVerse || startVerse;
    const verses = data.verses.filter(
      (v: { verse: number }) => v.verse >= startVerse && v.verse <= end
    );
    
    if (verses.length === 0) {
      console.error(`Verses ${startVerse}-${end} not found in chapter`);
      return null;
    }
    
    // Combine verse texts
    const text = verses
      .map((v: { text: string }) => v.text.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Format reference
    const verseRef = endVerse && endVerse !== startVerse 
      ? `${startVerse}-${endVerse}` 
      : `${startVerse}`;
    const reference = `${bookName} ${chapter}:${verseRef}`;
    
    return {
      reference,
      text,
      version,
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return null;
  }
}

/**
 * Get a random verse in the specified version
 */
export async function getRandomVerse(version: string = 'KJV'): Promise<{
  reference: string;
  text: string;
  version: string;
} | null> {
  const ref = getRandomVerseRef();
  return fetchVerse(ref.book, ref.chapter, ref.startVerse, ref.endVerse, version);
}

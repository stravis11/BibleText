/**
 * Bible API Integration
 * Uses API.Bible (free tier available) for multi-version, multi-language support
 */

// Bible versions and their API.Bible IDs
export const BIBLE_VERSIONS: Record<string, { id: string; name: string; language: string }> = {
  // English
  'ESV': { id: '9879dbb7cfe39e4d-01', name: 'English Standard Version', language: 'en' },
  'NIV': { id: '78a9f6124f344018-01', name: 'New International Version', language: 'en' },
  'KJV': { id: 'de4e12af7f28f599-02', name: 'King James Version', language: 'en' },
  'NLT': { id: '65eec8e0b60e656b-01', name: 'New Living Translation', language: 'en' },
  // Spanish
  'RVR': { id: 'b32b9d1b64b4ef29-01', name: 'Reina Valera 1909', language: 'es' },
  // German
  'DELUT': { id: 'f492a38d0e52db0f-01', name: 'Luther Bible 1912', language: 'de' },
  // French
  'LSG': { id: '3f0f8a9c2a4bd5a6-01', name: 'Louis Segond 1910', language: 'fr' },
  // Dutch
  'DUTSVV': { id: '23cc9e7b9b7e4e5e-01', name: 'Dutch Staten Vertaling', language: 'nl' },
  // Chinese (Mandarin)
  'CUVS': { id: '06125adad2d5898a-01', name: 'Chinese Union Simplified', language: 'zh' },
};

export const LANGUAGES = [
  { code: 'en', name: 'English', versions: ['ESV', 'NIV', 'KJV', 'NLT'] },
  { code: 'es', name: 'Spanish', versions: ['RVR'] },
  { code: 'de', name: 'German', versions: ['DELUT'] },
  { code: 'fr', name: 'French', versions: ['LSG'] },
  { code: 'nl', name: 'Dutch', versions: ['DUTSVV'] },
  { code: 'zh', name: 'Mandarin', versions: ['CUVS'] },
];

export const FREQUENCIES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

// Popular Bible verses for random selection
// These are verse references that work across most translations
export const VERSE_POOL = [
  'JHN.3.16', 'PSA.23.1-6', 'ROM.8.28', 'PHP.4.13', 'ISA.40.31',
  'JER.29.11', 'PRO.3.5-6', 'ROM.12.2', 'GAL.5.22-23', 'HEB.11.1',
  'JOS.1.9', 'PSA.46.10', 'MAT.11.28-30', 'ROM.5.8', '2CO.5.17',
  'EPH.2.8-9', 'PHP.4.6-7', 'PSA.119.105', '1CO.13.4-7', 'ROM.8.38-39',
  'ISA.41.10', 'MAT.6.33', 'PSA.37.4', 'PRO.22.6', 'COL.3.23',
  'HEB.12.1-2', '1PE.5.7', 'MAT.28.19-20', 'DEU.31.6', 'PSA.91.1-2',
  'JHN.14.6', 'JHN.1.1', 'GEN.1.1', 'ROM.3.23', 'EPH.6.10-11',
  'PSA.27.1', 'ISA.53.5', 'MAT.5.16', 'JAM.1.2-4', '2TI.1.7',
  'PSA.121.1-2', 'ROM.12.12', 'HEB.4.16', 'PSA.34.8', '1JN.4.19',
  'LAM.3.22-23', 'MIC.6.8', 'PRO.16.3', 'PSA.139.14', 'NAH.1.7',
];

/**
 * Get a random verse reference from the pool
 */
export function getRandomVerseReference(): string {
  return VERSE_POOL[Math.floor(Math.random() * VERSE_POOL.length)];
}

/**
 * Fetch a Bible verse using the free BibleGateway scraper approach
 * (API.Bible requires API key, so we use BibleGateway for free access)
 */
export async function fetchVerse(reference: string, version: string = 'ESV'): Promise<{
  reference: string;
  text: string;
  version: string;
} | null> {
  try {
    // Use Bible API (bible-api.com) - free, no API key needed
    // Supports many versions and languages
    const versionMap: Record<string, string> = {
      'ESV': 'web', // World English Bible as fallback
      'NIV': 'web',
      'KJV': 'kjv',
      'NLT': 'web',
      'RVR': 'rvr1960',
      'DELUT': 'lutherbibel1912',
      'LSG': 'ls1910',
      'DUTSVV': 'statenvertaling',
      'CUVS': 'cuv',
    };

    const apiVersion = versionMap[version] || 'web';
    
    // Convert reference format (JHN.3.16 -> john+3:16)
    const bookMap: Record<string, string> = {
      'GEN': 'genesis', 'EXO': 'exodus', 'LEV': 'leviticus', 'NUM': 'numbers',
      'DEU': 'deuteronomy', 'JOS': 'joshua', 'JDG': 'judges', 'RUT': 'ruth',
      '1SA': '1samuel', '2SA': '2samuel', '1KI': '1kings', '2KI': '2kings',
      '1CH': '1chronicles', '2CH': '2chronicles', 'EZR': 'ezra', 'NEH': 'nehemiah',
      'EST': 'esther', 'JOB': 'job', 'PSA': 'psalms', 'PRO': 'proverbs',
      'ECC': 'ecclesiastes', 'SNG': 'songofsolomon', 'ISA': 'isaiah', 'JER': 'jeremiah',
      'LAM': 'lamentations', 'EZK': 'ezekiel', 'DAN': 'daniel', 'HOS': 'hosea',
      'JOL': 'joel', 'AMO': 'amos', 'OBA': 'obadiah', 'JON': 'jonah',
      'MIC': 'micah', 'NAH': 'nahum', 'HAB': 'habakkuk', 'ZEP': 'zephaniah',
      'HAG': 'haggai', 'ZEC': 'zechariah', 'MAL': 'malachi',
      'MAT': 'matthew', 'MRK': 'mark', 'LUK': 'luke', 'JHN': 'john',
      'ACT': 'acts', 'ROM': 'romans', '1CO': '1corinthians', '2CO': '2corinthians',
      'GAL': 'galatians', 'EPH': 'ephesians', 'PHP': 'philippians', 'COL': 'colossians',
      '1TH': '1thessalonians', '2TH': '2thessalonians', '1TI': '1timothy', '2TI': '2timothy',
      'TIT': 'titus', 'PHM': 'philemon', 'HEB': 'hebrews', 'JAM': 'james',
      '1PE': '1peter', '2PE': '2peter', '1JN': '1john', '2JN': '2john',
      '3JN': '3john', 'JUD': 'jude', 'REV': 'revelation',
    };

    const parts = reference.split('.');
    const book = bookMap[parts[0]] || parts[0].toLowerCase();
    const chapter = parts[1];
    const verses = parts[2];
    
    const apiRef = `${book}+${chapter}:${verses.replace('-', '-')}`;
    
    const response = await fetch(
      `https://bible-api.com/${apiRef}?translation=${apiVersion}`
    );

    if (!response.ok) {
      console.error('Bible API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    return {
      reference: data.reference || reference,
      text: data.text?.trim() || '',
      version: version,
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return null;
  }
}

/**
 * Get a random verse in the specified version
 */
export async function getRandomVerse(version: string = 'ESV'): Promise<{
  reference: string;
  text: string;
  version: string;
} | null> {
  const reference = getRandomVerseReference();
  return fetchVerse(reference, version);
}

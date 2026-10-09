export interface AvatarOption {
  id: string;
  name: string;
  category: 'Classics' | 'Characters' | 'Pop Culture' | 'Gaming & Sci-Fi';
  url: string;
}

// Function to generate data-uri SVG avatars for crisp, offline-ready rendering
function createSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const AVATAR_COLLECTIONS: AvatarOption[] = [
  // --- The Classics ---
  {
    id: 'netflix-red',
    name: 'Classic Red Smile',
    category: 'Classics',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
  },
  {
    id: 'classic-blue',
    name: 'Cyan Chill Smile',
    category: 'Classics',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#0071EB"/>
        <circle cx="34" cy="40" r="7" fill="#ffffff"/>
        <circle cx="66" cy="40" r="7" fill="#ffffff"/>
        <path d="M 30 62 Q 50 82 70 62" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
      </svg>
    `)
  },
  {
    id: 'classic-yellow',
    name: 'Sunny Gold Smile',
    category: 'Classics',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#E5A00D"/>
        <circle cx="34" cy="42" r="7" fill="#ffffff"/>
        <circle cx="66" cy="42" r="7" fill="#ffffff"/>
        <path d="M 32 60 Q 50 78 68 60" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
      </svg>
    `)
  },
  {
    id: 'classic-green',
    name: 'Emerald Smirk',
    category: 'Classics',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#46D369"/>
        <rect x="28" y="38" width="12" height="6" rx="3" fill="#141414"/>
        <rect x="60" y="38" width="12" height="6" rx="3" fill="#141414"/>
        <path d="M 35 62 Q 54 74 68 58" stroke="#141414" stroke-width="7" stroke-linecap="round" fill="none"/>
      </svg>
    `)
  },
  {
    id: 'classic-purple',
    name: 'Royal Purple Wink',
    category: 'Classics',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#9333EA"/>
        <circle cx="34" cy="40" r="7" fill="#ffffff"/>
        <path d="M 59 40 Q 66 32 73 40" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M 30 62 Q 50 80 70 62" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
      </svg>
    `)
  },
  {
    id: 'classic-kids',
    name: 'Kids Joy',
    category: 'Classics',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="kidsGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#06B6D4"/>
            <stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="8" fill="url(#kidsGrad)"/>
        <circle cx="32" cy="38" r="8" fill="#ffffff"/>
        <circle cx="68" cy="38" r="8" fill="#ffffff"/>
        <circle cx="34" cy="38" r="4" fill="#0E7490"/>
        <circle cx="66" cy="38" r="4" fill="#0E7490"/>
        <path d="M 28 58 Q 50 86 72 58 Z" fill="#ffffff"/>
        <path d="M 40 70 Q 50 82 60 70" stroke="#EF4444" stroke-width="4" fill="#EF4444"/>
      </svg>
    `)
  },

  // --- Characters & Heroes ---
  {
    id: 'character-superhero',
    name: 'Red Mask Hero',
    category: 'Characters',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#1F2937"/>
        <path d="M 15 35 Q 50 20 85 35 L 80 60 Q 50 75 20 60 Z" fill="#E50914"/>
        <ellipse cx="36" cy="48" rx="8" ry="4" fill="#ffffff" transform="rotate(-10 36 48)"/>
        <ellipse cx="64" cy="48" rx="8" ry="4" fill="#ffffff" transform="rotate(10 64 48)"/>
        <polygon points="50,22 55,30 45,30" fill="#FBBF24"/>
      </svg>
    `)
  },
  {
    id: 'character-agent',
    name: 'Secret Detective',
    category: 'Characters',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#181818"/>
        <ellipse cx="50" cy="32" rx="35" ry="12" fill="#374151"/>
        <rect x="28" y="16" width="44" height="22" rx="4" fill="#4B5563"/>
        <rect x="28" y="32" width="44" height="4" fill="#E50914"/>
        <rect x="25" y="48" width="22" height="12" rx="2" fill="#111827" stroke="#9CA3AF" stroke-width="2"/>
        <rect x="53" y="48" width="22" height="12" rx="2" fill="#111827" stroke="#9CA3AF" stroke-width="2"/>
        <line x1="47" y1="54" x2="53" y2="54" stroke="#9CA3AF" stroke-width="2"/>
        <path d="M 40 76 Q 50 78 60 76" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `)
  },
  {
    id: 'character-ninja',
    name: 'Cyber Ninja',
    category: 'Characters',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#09090B"/>
        <path d="M 20 25 L 80 25 L 75 85 L 25 85 Z" fill="#27272A"/>
        <rect x="24" y="42" width="52" height="16" rx="4" fill="#000000" stroke="#E50914" stroke-width="2"/>
        <ellipse cx="38" cy="50" rx="6" ry="2" fill="#E50914"/>
        <ellipse cx="62" cy="50" rx="6" ry="2" fill="#E50914"/>
        <line x1="15" y1="28" x2="85" y2="28" stroke="#E50914" stroke-width="4"/>
      </svg>
    `)
  },
  {
    id: 'character-penguin',
    name: 'Cool Penguin',
    category: 'Characters',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#0284C7"/>
        <ellipse cx="50" cy="55" rx="30" ry="32" fill="#0F172A"/>
        <ellipse cx="50" cy="62" rx="20" ry="22" fill="#FFFFFF"/>
        <polygon points="50,56 42,66 58,66" fill="#F59E0B"/>
        <rect x="28" y="44" width="19" height="10" rx="2" fill="#000000"/>
        <rect x="53" y="44" width="19" height="10" rx="2" fill="#000000"/>
        <line x1="47" y1="49" x2="53" y2="49" stroke="#000000" stroke-width="3"/>
      </svg>
    `)
  },

  // --- Gaming & Sci-Fi ---
  {
    id: 'scifi-astronaut',
    name: 'Deep Space Astronaut',
    category: 'Gaming & Sci-Fi',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#030712"/>
        <circle cx="50" cy="50" r="34" fill="#F3F4F6"/>
        <ellipse cx="50" cy="50" rx="26" ry="22" fill="#1E1B4B" stroke="#F59E0B" stroke-width="3"/>
        <path d="M 32 42 Q 44 34 58 40" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>
        <circle cx="62" cy="46" r="3" fill="#60A5FA"/>
      </svg>
    `)
  },
  {
    id: 'scifi-mecha',
    name: 'Cyberpunk Mecha',
    category: 'Gaming & Sci-Fi',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#18181B"/>
        <polygon points="50,18 78,35 70,82 30,82 22,35" fill="#3F3F46"/>
        <polygon points="50,26 72,40 66,74 34,74 28,40" fill="#27272A"/>
        <rect x="30" y="46" width="40" height="8" rx="2" fill="#06B6D4" stroke="#22D3EE" stroke-width="1"/>
        <polygon points="50,62 56,70 44,70" fill="#E50914"/>
      </svg>
    `)
  },
  {
    id: 'gaming-controller',
    name: 'Pro Gamer',
    category: 'Gaming & Sci-Fi',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#7C3AED"/>
        <path d="M 22 42 Q 35 28 50 30 Q 65 28 78 42 L 72 74 Q 62 82 56 68 L 50 62 L 44 68 Q 38 82 28 74 Z" fill="#18181B"/>
        <polygon points="34,44 38,44 38,40 42,40 42,44 46,44 46,48 42,48 42,52 38,52 38,48 34,48" fill="#9CA3AF"/>
        <circle cx="60" cy="44" r="3" fill="#EF4444"/>
        <circle cx="68" cy="44" r="3" fill="#3B82F6"/>
        <circle cx="64" cy="50" r="3" fill="#10B981"/>
      </svg>
    `)
  },
  {
    id: 'scifi-skull',
    name: 'Neon Skull',
    category: 'Gaming & Sci-Fi',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#050505"/>
        <path d="M 30 40 C 30 22 70 22 70 40 C 70 54 62 58 62 70 L 38 70 C 38 58 30 54 30 40 Z" fill="#18181B" stroke="#EC4899" stroke-width="3"/>
        <circle cx="40" cy="44" r="6" fill="#06B6D4"/>
        <circle cx="60" cy="44" r="6" fill="#06B6D4"/>
        <line x1="44" y1="70" x2="44" y2="62" stroke="#EC4899" stroke-width="2"/>
        <line x1="50" y1="70" x2="50" y2="62" stroke="#EC4899" stroke-width="2"/>
        <line x1="56" y1="70" x2="56" y2="62" stroke="#EC4899" stroke-width="2"/>
      </svg>
    `)
  },

  // --- Pop Culture & Cinema ---
  {
    id: 'cinema-popcorn',
    name: 'Cinema Popcorn',
    category: 'Pop Culture',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#B91C1C"/>
        <circle cx="36" cy="30" r="10" fill="#FEF08A"/>
        <circle cx="50" cy="24" r="11" fill="#FDE047"/>
        <circle cx="64" cy="30" r="10" fill="#FEF08A"/>
        <circle cx="44" cy="34" r="9" fill="#FACC15"/>
        <circle cx="58" cy="34" r="9" fill="#FACC15"/>
        <polygon points="28,42 72,42 66,88 34,88" fill="#F8FAFC"/>
        <polygon points="36,42 42,42 40,88 36,88" fill="#DC2626"/>
        <polygon points="47,42 53,42 52,88 48,88" fill="#DC2626"/>
        <polygon points="58,42 64,42 61,88 57,88" fill="#DC2626"/>
      </svg>
    `)
  },
  {
    id: 'cinema-director',
    name: 'Film Clapper',
    category: 'Pop Culture',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="8" fill="#111827"/>
        <rect x="20" y="38" width="60" height="44" rx="4" fill="#1F2937" stroke="#374151" stroke-width="2"/>
        <path d="M 18 36 L 78 22 L 82 34 L 22 48 Z" fill="#1F2937" stroke="#4B5563" stroke-width="2"/>
        <polygon points="24,35 32,33 28,47 20,48" fill="#F3F4F6"/>
        <polygon points="40,31 48,29 44,43 36,45" fill="#F3F4F6"/>
        <polygon points="56,27 64,25 60,39 52,41" fill="#F3F4F6"/>
        <polygon points="72,23 78,22 76,35 70,37" fill="#F3F4F6"/>
        <text x="50" y="65" font-family="Arial" font-size="10" font-weight="900" fill="#E50914" text-anchor="middle">PIXELL</text>
      </svg>
    `)
  }
];

export const DEFAULT_AVATAR = AVATAR_COLLECTIONS[0].url;

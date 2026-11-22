export const NOTE_TAGS = ['Ide', 'Kerja', 'Pribadi', 'Keuangan'] as const;

const PRESET_TONES: Record<string, string> = {
  ide: 'bg-lavender text-ink',
  kerja: 'bg-sky text-ink',
  pribadi: 'bg-mint text-ink',
  keuangan: 'bg-[#ffe0c2] text-ink',
};

const FALLBACK_TONES = ['bg-periwinkle-wash text-ink', 'bg-aqua text-ink', 'bg-lavender text-ink'];

/** Pastel badge tone per tag: presets stay stable, free-form tags hash into the palette. */
export function tagTone(tag: string): string {
  const key = tag.trim().toLowerCase();
  if (PRESET_TONES[key]) return PRESET_TONES[key];
  let sum = 0;
  for (const ch of key) sum += ch.charCodeAt(0);
  return FALLBACK_TONES[sum % FALLBACK_TONES.length];
}

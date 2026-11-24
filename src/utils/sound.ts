/**
 * Soft two-tap chime for reminders, synthesised with the Web Audio API so the app
 * ships no audio files. Safe to call anywhere: silently no-ops when the browser
 * has no `AudioContext` or the context cannot be resumed.
 */
let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null;
  audioContext ??= new window.AudioContext();
  return audioContext;
}

/** One bell-like tap: fast attack, exponential decay, sine partial. */
function tap(context: AudioContext, at: number, frequency: number) {
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, at);

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);

  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(at);
  osc.stop(at + 0.36);
}

export function playNotificationSound(): void {
  const context = getContext();
  if (!context) return;

  if (context.state === 'suspended') void context.resume();

  const start = context.currentTime + 0.02;
  tap(context, start, 880); // A5
  tap(context, start + 0.16, 1318.51); // E6
}

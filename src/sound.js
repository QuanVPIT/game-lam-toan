// Hiệu ứng âm thanh (Web Audio) và giọng đọc tiếng Việt (Speech Synthesis)
let ctx = null;
let enabled = true;

export const setSoundEnabled = (on) => {
  enabled = on;
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
};

function audio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.25) {
  const c = audio();
  if (!c || !enabled) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  click: () => tone(660, 0, 0.08, 'triangle', 0.2),
  right: () => {
    tone(784, 0, 0.12, 'triangle');
    tone(1047, 0.1, 0.18, 'triangle');
    tone(1319, 0.22, 0.25, 'triangle');
  },
  wrong: () => {
    tone(220, 0, 0.18, 'square', 0.12);
    tone(180, 0.15, 0.25, 'square', 0.12);
  },
  win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle')),
  lose: () => [523, 466, 415, 392].forEach((f, i) => tone(f, i * 0.18, 0.3, 'sine', 0.2)),
  unlock: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.9 + i * 0.09, 0.3, 'sine', 0.2)),
};

// Tìm giọng tiếng Việt. Ưu tiên giọng Google/online (tự nhiên hơn), sau đó tới giọng có sẵn trên máy (vd "Linh" trên Mac).
let viVoice = null;
function pickVoice() {
  if (viVoice) return viVoice;
  const vs = speechSynthesis.getVoices().filter((v) => /^vi([-_]|$)/i.test(v.lang));
  viVoice = vs.find((v) => /google/i.test(v.name)) || vs.find((v) => !v.localService) || vs[0] || null;
  return viVoice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function speak(text) {
  if (!enabled || !('speechSynthesis' in window)) return;
  const voice = pickVoice();
  if (!voice) return; // không có giọng Việt thì im lặng, tránh đọc bằng giọng tiếng Anh
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang;
    u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.15;
    speechSynthesis.speak(u);
  } catch {}
}

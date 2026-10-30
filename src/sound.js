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
  return enabled ? ctx : null;
}

// Một nốt nhạc; `to` là tần số đích nếu muốn trượt cao độ
function tone(freq, start, dur, { type = 'sine', vol = 0.25, to } = {}) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Tiếng vỗ tay: nhiều tiếng "lách tách" ngẫu nhiên từ nhiễu trắng
function applause(start = 0, length = 1.4) {
  const c = audio();
  if (!c) return;
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, Math.floor(sr * length), sr);
  const data = buf.getChannelData(0);
  for (let k = 0; k < length * 70; k++) {
    const pos = Math.floor(Math.random() * (data.length - sr * 0.03));
    const fade = 1 - pos / data.length; // nhỏ dần về cuối
    for (let j = 0; j < sr * 0.02; j++) data[pos + j] += (Math.random() * 2 - 1) * Math.exp(-j / (sr * 0.004)) * fade;
  }
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const g = c.createGain();
  src.buffer = buf;
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  g.gain.value = 0.35;
  src.connect(filter).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Các kiểu âm thanh khi trả lời đúng, mỗi lần chọn ngẫu nhiên một kiểu
const RIGHT_SOUNDS = [
  // chuông leng keng
  () => [784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.25, { type: 'triangle' })),
  // đàn xylophone chạy lên
  () => [523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, { type: 'sine', vol: 0.3 })),
  // còi trượt "vút"
  () => tone(400, 0, 0.45, { type: 'sine', to: 1800, vol: 0.2 }),
  // bong bóng "póc póc póc"
  () => [0, 0.12, 0.24].forEach((s, i) => tone(500 + i * 200, s, 0.1, { to: 1400 + i * 300, vol: 0.3 })),
  // nhặt xu "ting ting"
  () => {
    tone(988, 0, 0.08, { type: 'square', vol: 0.12 });
    tone(1319, 0.08, 0.35, { type: 'square', vol: 0.12 });
  },
  // lò xo "boing" vui
  () => {
    tone(300, 0, 0.18, { type: 'triangle', to: 900 });
    tone(900, 0.18, 0.3, { type: 'triangle', to: 1200, vol: 0.2 });
  },
];

const WRONG_SOUNDS = [
  // "ối ối"
  () => {
    tone(520, 0, 0.15, { type: 'triangle', vol: 0.22 });
    tone(390, 0.17, 0.3, { type: 'triangle', vol: 0.22 });
  },
  // trượt xuống "tuột"
  () => tone(500, 0, 0.4, { type: 'sawtooth', to: 150, vol: 0.08 }),
  // "bùm bụp"
  () => {
    tone(200, 0, 0.12, { type: 'square', vol: 0.1 });
    tone(160, 0.14, 0.2, { type: 'square', vol: 0.1 });
  },
];

export const sfx = {
  click: () => tone(660, 0, 0.08, { type: 'triangle', vol: 0.2 }),
  right: () => {
    pick(RIGHT_SOUNDS)();
    if (Math.random() < 0.3) applause(0.2, 1);
  },
  wrong: () => pick(WRONG_SOUNDS)(),
  win: () => {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle' }));
    applause(0.3, 2.2);
  },
  lose: () => [523, 466, 415, 392].forEach((f, i) => tone(f, i * 0.18, 0.3, { vol: 0.2 })),
  unlock: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 1 + i * 0.09, 0.3, { vol: 0.2 })),
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

// `cheer`: đọc vui tươi hơn (cao giọng, nhanh hơn) dùng cho lời khen
export function speak(text, { cheer = false } = {}) {
  if (!enabled || !('speechSynthesis' in window)) return;
  const voice = pickVoice();
  if (!voice) return; // không có giọng Việt thì im lặng, tránh đọc bằng giọng tiếng Anh
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang;
    u.voice = voice;
    u.rate = cheer ? 1.05 : 0.9;
    u.pitch = cheer ? 1.4 : 1.15;
    speechSynthesis.speak(u);
  } catch {}
}

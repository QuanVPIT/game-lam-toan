// Lưu điểm và tiến độ trên trình duyệt (localStorage)
import { MODES } from './config.js';

const KEY = 'nhadan-math-v1';

const emptyProgress = () => Object.fromEntries(Object.keys(MODES).map((m) => [m, {}]));
const empty = () => ({ sound: true, progress: emptyProgress() });

export function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.progress) {
      // Chỉ giữ các loại bài đang có (bỏ dữ liệu của loại bài đã xoá)
      const progress = emptyProgress();
      for (const m of Object.keys(progress)) progress[m] = s.progress[m] || {};
      return { sound: s.sound !== false, progress };
    }
  } catch {}
  return empty();
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {}
}

export const resetProgress = (save) => ({ ...save, progress: emptyProgress() });

export const getRecord = (save, mode, i) => save.progress[mode]?.[i] || { stars: 0, score: 0 };

export const isUnlocked = (save, mode, i) => i === 0 || getRecord(save, mode, i - 1).stars > 0;

export function totals(save) {
  let stars = 0;
  let score = 0;
  for (const m of Object.keys(save.progress)) {
    for (const r of Object.values(save.progress[m])) {
      stars += r.stars;
      score += r.score;
    }
  }
  return { stars, score };
}

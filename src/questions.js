// Sinh câu hỏi theo loại bài và giới hạn của level
import { MAX_SUBTRAHEND } from './config.js';

export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const CMP_CHOICES = ['>', '<', '='];
export const CMP_LABEL = { '>': 'lớn hơn', '<': 'bé hơn', '=': 'bằng' };

function makeQuestion(mode, max) {
  // 75% câu hỏi dùng khoảng số mới của level (vd level 30: số 21–30)
  const low = max <= 10 ? 0 : max - 10;
  const hard = Math.random() < 0.75;
  const top = () => (hard ? rnd(Math.max(2, low + 1), max) : rnd(2, max));

  if (mode === 'add') {
    // Tổng đến 99
    const sum = top();
    const a = rnd(1, sum - 1);
    return { nums: [a, sum - a], op: '+', ans: sum };
  }

  if (mode === 'sub') {
    // Số trừ từ 1 đến 10
    const a = top();
    const b = rnd(1, Math.min(MAX_SUBTRAHEND, a));
    return { nums: [a, b], op: '-', ans: a - b };
  }

  // So sánh: điền dấu >, <, =
  let a = top();
  let b;
  const r = Math.random();
  const tens = Math.floor(a / 10) * 10;
  const tensTop = Math.min(tens + 9, max);
  if (r < 0.15) b = a; // bằng nhau
  else {
    do {
      // cùng hàng chục để bé phải nhìn hàng đơn vị
      if (r < 0.55 && a >= 10 && tensTop > tens) b = rnd(tens, tensTop);
      else b = rnd(Math.max(0, low - 5), max);
    } while (b === a);
  }
  if (Math.random() < 0.5) [a, b] = [b, a];
  return { nums: [a, b], op: '?', ans: a > b ? '>' : a < b ? '<' : '=' };
}

function makeChoices(ans, max) {
  const set = new Set([ans]);
  for (const d of shuffle([1, -1, 2, -2, 3, -3, 10, -10, 4, -4, 5, -5])) {
    if (set.size >= 4) break;
    const v = ans + d;
    if (v >= 0 && v <= max) set.add(v);
  }
  for (let v = 0; set.size < 4; v++) set.add(v);
  return shuffle([...set]);
}

export function buildLevel(mode, max, count) {
  const seen = new Set();
  const list = [];
  let guard = 0;
  while (list.length < count) {
    const q = makeQuestion(mode, max);
    const key = q.nums.join(q.op);
    if (seen.has(key) && guard++ < 500) continue;
    seen.add(key);
    list.push({ ...q, choices: mode === 'cmp' ? CMP_CHOICES : makeChoices(q.ans, max) });
  }
  return list;
}

export function questionSpeech(q) {
  const [a, b] = q.nums;
  if (q.op === '?') return `${a} và ${b}, điền dấu gì?`;
  return `${a} ${q.op === '+' ? 'cộng' : 'trừ'} ${b} bằng mấy?`;
}

// Sinh câu hỏi theo loại bài và giới hạn của level
export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function makeQuestion(mode, max) {
  // 75% câu hỏi rơi vào khoảng số mới của level (vd level 30: kết quả 21–30)
  const low = max <= 10 ? 0 : max - 10;
  const hard = Math.random() < 0.75;

  if (mode === 'add') {
    const sum = hard ? rnd(Math.max(2, low + 1), max) : rnd(2, max);
    const a = rnd(1, sum - 1);
    return { nums: [a, sum - a], ops: ['+'], ans: sum };
  }

  if (mode === 'sub') {
    const a = hard ? rnd(Math.max(2, low + 1), max) : rnd(2, max);
    const b = rnd(1, a);
    return { nums: [a, b], ops: ['-'], ans: a - b };
  }

  // Cộng trừ kết hợp: a ± b ± c, mọi kết quả trung gian nằm trong [0, max]
  for (let k = 0; k < 200; k++) {
    const ops = Math.random() < 0.5 ? ['+', '-'] : ['-', '+'];
    const a = rnd(Math.max(1, Math.floor(low / 2)), max);
    let b, r1;
    if (ops[0] === '+') {
      if (a >= max) continue;
      b = rnd(1, max - a);
      r1 = a + b;
    } else {
      b = rnd(1, a);
      r1 = a - b;
    }
    let c, ans;
    if (ops[1] === '+') {
      if (r1 >= max) continue;
      c = rnd(1, max - r1);
      ans = r1 + c;
    } else {
      if (r1 < 1) continue;
      c = rnd(1, r1);
      ans = r1 - c;
    }
    return { nums: [a, b, c], ops, ans };
  }
  return { nums: [3, 2, 1], ops: ['+', '-'], ans: 4 };
}

function makeChoices(ans, max) {
  const set = new Set([ans]);
  for (const d of shuffle([1, -1, 2, -2, 3, -3, 10, -10, 4, -4, 5, -5])) {
    if (set.size >= 4) break;
    const v = ans + d;
    if (v >= 0 && v <= max + 10) set.add(v);
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
    const key = q.nums.join(',') + q.ops.join('');
    if (seen.has(key) && guard++ < 500) continue;
    seen.add(key);
    list.push({ ...q, choices: makeChoices(q.ans, max) });
  }
  return list;
}

export function questionSpeech(q) {
  let t = String(q.nums[0]);
  q.ops.forEach((o, j) => {
    t += ` ${o === '+' ? 'cộng' : 'trừ'} ${q.nums[j + 1]}`;
  });
  return t + ' bằng mấy?';
}

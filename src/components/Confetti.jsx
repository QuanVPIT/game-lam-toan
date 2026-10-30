import { useEffect, useState } from 'react';
import { rnd } from '../questions.js';

const ITEMS = ['🎉', '⭐', '🌟', '🎈', '💖', '🍬', '✨'];
let nextId = 0;

// Mỗi lần `fire` thay đổi sẽ bắn ra `count` hạt pháo giấy
export default function Confetti({ fire, count = 8 }) {
  const [bits, setBits] = useState([]);

  useEffect(() => {
    if (!fire) return;
    const batch = Array.from({ length: count }, () => ({
      id: nextId++,
      ch: ITEMS[rnd(0, ITEMS.length - 1)],
      left: rnd(0, 96),
      dur: 1.6 + Math.random() * 1.8,
      delay: Math.random() * 0.4,
    }));
    setBits((b) => [...b, ...batch]);
    const t = setTimeout(() => setBits((b) => b.filter((x) => !batch.includes(x))), 4200);
    return () => clearTimeout(t);
  }, [fire, count]);

  return bits.map((b) => (
    <div
      key={b.id}
      className="confetti"
      style={{ left: `${b.left}vw`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
    >
      {b.ch}
    </div>
  ));
}

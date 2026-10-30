import { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import Confetti from '../components/Confetti.jsx';
import { EMOJI, LEVELS, MODES, POINTS, PRAISE, QUESTIONS, starsFor } from '../config.js';
import { buildLevel, questionSpeech, rnd } from '../questions.js';
import { sfx, speak } from '../sound.js';

// Hình minh hoạ để bé đếm khi các số đều nhỏ (≤ 10)
function Visual({ q }) {
  const emoji = useMemo(() => EMOJI[rnd(0, EMOJI.length - 1)], [q]);
  if (q.nums.length !== 2 || Math.max(...q.nums) > 10) return null;
  const [a, b] = q.nums;
  if (q.ops[0] === '+') {
    return (
      <div className="visual">
        <span className="grp">{emoji.repeat(a) || ' '}</span> + <span className="grp">{emoji.repeat(b) || ' '}</span>
      </div>
    );
  }
  return (
    <div className="visual">
      <span className="grp">
        {emoji.repeat(a - b)}
        <span className="gone">{emoji.repeat(b)}</span>
      </span>
    </div>
  );
}

export default function Game({ mode, levelIdx, onQuit, onFinish, ...bar }) {
  const max = LEVELS[levelIdx];
  const questions = useMemo(() => buildLevel(mode, max, QUESTIONS), [mode, max]);
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState([]); // các đáp án sai đã bấm ở câu hiện tại
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [fire, setFire] = useState(0);
  const timer = useRef(null);

  const q = questions[i];

  useEffect(() => {
    const t = setTimeout(() => speak(questionSpeech(q)), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const pick = (v) => {
    if (solved || wrongs.includes(v)) return;
    if (v === q.ans) {
      const firstTry = wrongs.length === 0;
      const newCorrect = correct + (firstTry ? 1 : 0);
      const newScore = score + (firstTry ? POINTS : 0);
      setCorrect(newCorrect);
      setScore(newScore);
      setSolved(true);
      const p = PRAISE[rnd(0, PRAISE.length - 1)];
      setFeedback({ ok: true, text: `${p} 🎉` });
      sfx.right();
      speak(p);
      setFire((f) => f + 1);
      timer.current = setTimeout(() => {
        if (i + 1 >= QUESTIONS) {
          onFinish({ correct: newCorrect, score: newScore, stars: starsFor(newCorrect) });
        } else {
          setI(i + 1);
          setWrongs([]);
          setSolved(false);
          setFeedback(null);
        }
      }, 1300);
    } else {
      setWrongs([...wrongs, v]);
      setFeedback({ ok: false, text: 'Chưa đúng, thử lại nhé! 💪' });
      sfx.wrong();
      speak('Thử lại nhé');
    }
  };

  return (
    <section className="screen">
      <TopBar
        leftIcon="⬅️"
        onLeft={() => {
          if (confirm('Thoát level này? Điểm của lượt này sẽ không được lưu.')) onQuit();
        }}
        middle={
          <div className="pill">
            {MODES[mode].short} · {max}
          </div>
        }
        {...bar}
        score={score}
      />
      <div className="progress">
        <div style={{ width: `${((i + (solved ? 1 : 0)) / QUESTIONS) * 100}%` }} />
      </div>
      <div className="qcard">
        <button className="iconbtn speak" onClick={() => speak(questionSpeech(q))} aria-label="Đọc lại">
          🗣️
        </button>
        <div className="qnum">
          Câu {i + 1}/{QUESTIONS}
        </div>
        <div className="question">
          {q.nums[0]}
          {q.ops.map((o, j) => (
            <span key={j}>
              {' '}
              <span className="op">{o === '-' ? '−' : '+'}</span> {q.nums[j + 1]}
            </span>
          ))}{' '}
          <span className="op">=</span> <span className="q">{solved ? q.ans : '?'}</span>
        </div>
        <Visual q={q} />
      </div>
      <div className="answers">
        {q.choices.map((v) => (
          <button
            key={`${i}-${v}`}
            className={`ans${wrongs.includes(v) ? ' wrong' : ''}${solved && v === q.ans ? ' right' : ''}`}
            disabled={wrongs.includes(v)}
            onClick={() => pick(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback ? (feedback.ok ? 'ok' : 'no') : ''}`}>{feedback?.text}</div>
      <Confetti fire={fire} count={6} />
    </section>
  );
}

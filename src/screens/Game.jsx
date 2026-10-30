import { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import Confetti from '../components/Confetti.jsx';
import { ENCOURAGE, LEVELS, MODES, POINTS, PRAISE, QUESTIONS, starsFor } from '../config.js';
import { buildLevel, CMP_LABEL, questionSpeech, rnd } from '../questions.js';
import { sfx, speak } from '../sound.js';

const pick = (list) => list[rnd(0, list.length - 1)];

export default function Game({ mode, levelIdx, onQuit, onFinish, ...bar }) {
  const max = LEVELS[levelIdx];
  const isCmp = mode === 'cmp';
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

  const choose = (v) => {
    if (solved || wrongs.includes(v)) return;
    if (v === q.ans) {
      const firstTry = wrongs.length === 0;
      const newCorrect = correct + (firstTry ? 1 : 0);
      const newScore = score + (firstTry ? POINTS : 0);
      setCorrect(newCorrect);
      setScore(newScore);
      setSolved(true);
      const p = pick(PRAISE);
      setFeedback({ ok: true, text: `${p} 🎉` });
      sfx.right();
      setTimeout(() => speak(p, { cheer: true }), 250);
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
      }, 2000);
    } else {
      const e = pick(ENCOURAGE);
      setWrongs([...wrongs, v]);
      setFeedback({ ok: false, text: `${e} 💪` });
      sfx.wrong();
      setTimeout(() => speak(e), 250);
    }
  };

  const [a, b] = q.nums;

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
          {isCmp && ' · Điền dấu > < ='}
        </div>
        {isCmp ? (
          <div className="question">
            {a} <span className={`q box${solved ? ' done' : ''}`}>{solved ? q.ans : '?'}</span> {b}
          </div>
        ) : (
          <div className="question">
            {a} <span className="op">{q.op === '-' ? '−' : '+'}</span> {b} <span className="op">=</span>{' '}
            <span className="q">{solved ? q.ans : '?'}</span>
          </div>
        )}
      </div>
      <div className={`answers${isCmp ? ' cmp' : ''}`}>
        {q.choices.map((v) => (
          <button
            key={`${i}-${v}`}
            className={`ans${wrongs.includes(v) ? ' wrong' : ''}${solved && v === q.ans ? ' right' : ''}`}
            disabled={wrongs.includes(v)}
            onClick={() => choose(v)}
          >
            {v}
            {isCmp && <small>{CMP_LABEL[v]}</small>}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback ? (feedback.ok ? 'ok' : 'no') : ''}`}>{feedback?.text}</div>
      <Confetti fire={fire} count={8} />
    </section>
  );
}

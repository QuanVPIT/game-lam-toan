import { useEffect } from 'react';
import Stars from '../components/Stars.jsx';
import Confetti from '../components/Confetti.jsx';
import { LEVELS, PASS, QUESTIONS } from '../config.js';
import { sfx, speak } from '../sound.js';

export default function Result({ correct, score, stars, unlocked, levelIdx, onNext, onRetry, onLevels }) {
  const passed = stars > 0;
  const title = stars === 3 ? 'Hoàn hảo! Nhã Đan giỏi quá!' : passed ? 'Qua level rồi! 🎉' : 'Cố lên Nhã Đan ơi!';
  const hasNext = passed && levelIdx + 1 < LEVELS.length;

  useEffect(() => {
    if (passed) {
      sfx.win();
      if (unlocked) sfx.unlock();
      speak(title.replace('🎉', ''));
    } else {
      sfx.lose();
      speak('Cố lên Nhã Đan ơi! Mình chơi lại nhé!');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const btn = (label, cls, fn) => (
    <button
      className={cls}
      onClick={() => {
        sfx.click();
        fn();
      }}
    >
      {label}
    </button>
  );

  return (
    <section className="screen result">
      <div className="rcard">
        <div className="rstars">
          <Stars n={stars} animate />
        </div>
        <div className="rtitle">{title}</div>
        <div className="rscore">
          Đúng {correct}/{QUESTIONS} câu · {score} điểm
          {!passed && ` (cần đúng ${PASS} câu để qua)`}
        </div>
        <div className="unlock">
          {unlocked && `🔓 Đã mở Level ${levelIdx + 2} (${LEVELS[levelIdx + 1]})!`}
          {passed && levelIdx === LEVELS.length - 1 && '🏅 Con đã hoàn thành tất cả level!'}
        </div>
        <div className="rbtns">
          {hasNext && btn('Level tiếp ▶', 'b-green', onNext)}
          {btn('Chơi lại ↻', 'b-orange', onRetry)}
          {btn('Các level', 'b-blue', onLevels)}
        </div>
      </div>
      {passed && <Confetti fire={1} count={40} />}
    </section>
  );
}

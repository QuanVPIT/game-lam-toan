import TopBar from '../components/TopBar.jsx';
import Stars from '../components/Stars.jsx';
import { LEVELS, MODES } from '../config.js';
import { getRecord, isUnlocked } from '../storage.js';
import { sfx, speak } from '../sound.js';

export default function LevelSelect({ save, mode, onBack, onPlay, ...bar }) {
  // Level đầu tiên đang mở mà chưa qua → nhấp nháy gợi ý
  const nextIdx = LEVELS.findIndex((_, i) => isUnlocked(save, mode, i) && getRecord(save, mode, i).stars === 0);

  return (
    <section className="screen">
      <TopBar leftIcon="⬅️" onLeft={onBack} {...bar} />
      <h2 className="title">{MODES[mode].name}</h2>
      <div className="levels">
        {LEVELS.map((max, i) => {
          const open = isUnlocked(save, mode, i);
          const r = getRecord(save, mode, i);
          return (
            <button
              key={max}
              className={`lvl${open ? '' : ' locked'}${i === nextIdx ? ' next' : ''}`}
              onClick={() => {
                if (!open) {
                  sfx.wrong();
                  speak('Con hãy qua level trước nhé!');
                  return;
                }
                sfx.click();
                onPlay(i);
              }}
            >
              <div className="n">Level {i + 1}</div>
              <div className="v">{max}</div>
              <div className="stars">{open && <Stars n={r.stars} />}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

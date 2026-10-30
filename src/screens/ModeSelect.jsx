import TopBar from '../components/TopBar.jsx';
import { LEVELS, MODES } from '../config.js';
import { getRecord } from '../storage.js';
import { sfx } from '../sound.js';

export default function ModeSelect({ save, onHome, onPick, onReset, ...bar }) {
  return (
    <section className="screen">
      <TopBar leftIcon="🏠" onLeft={onHome} {...bar} />
      <h2 className="title">Con muốn học gì nào?</h2>
      <div className="modes">
        {Object.entries(MODES).map(([key, m]) => {
          const passed = LEVELS.filter((_, i) => getRecord(save, key, i).stars > 0).length;
          const stars = LEVELS.reduce((a, _, i) => a + getRecord(save, key, i).stars, 0);
          return (
            <button
              key={key}
              className={`mode ${m.cls}`}
              onClick={() => {
                sfx.click();
                onPick(key);
              }}
            >
              <div className="sym">{m.sym}</div>
              <div className="lbl">{m.name}</div>
              <div className="prog">
                Đã qua {passed}/{LEVELS.length} · ⭐ {stars}
              </div>
            </button>
          );
        })}
      </div>
      <button
        className="resetbtn"
        onClick={() => {
          if (confirm('Xoá hết điểm và khoá lại các level?')) onReset();
        }}
      >
        Xoá điểm, chơi lại từ đầu
      </button>
    </section>
  );
}

import { sfx } from '../sound.js';

export default function TopBar({ leftIcon, onLeft, middle, stars, score, sound, onToggleSound }) {
  return (
    <div className="topbar">
      <button
        className="iconbtn"
        onClick={() => {
          sfx.click();
          onLeft();
        }}
        aria-label="Quay lại"
      >
        {leftIcon}
      </button>
      {middle ?? <div className="pill">⭐ {stars}</div>}
      <div className="pill">🏆 {score}</div>
      <button className="iconbtn" onClick={onToggleSound} aria-label="Bật/tắt âm thanh">
        {sound ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

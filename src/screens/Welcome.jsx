import { sfx, speak } from '../sound.js';

const FLOATIES = ['1', '2', '3', '+', '−', '5', '🌟', '8', '🎈', '=', '7', '🍭'];

export default function Welcome({ onStart }) {
  return (
    <section className="screen welcome">
      {FLOATIES.map((t, i) => (
        <div
          key={i}
          className="floaty"
          style={{ left: `${i * 8 + 2}%`, animationDelay: `${-i * 0.6}s`, animationDuration: `${6 + (i % 4)}s` }}
        >
          {t}
        </div>
      ))}
      <div className="mascot">🦄</div>
      <h1 className="hello">
        <span style={{ animationDelay: '0s' }}>Xin</span> <span style={{ animationDelay: '.15s' }}>Chào</span>
        <br />
        <span className="name" style={{ animationDelay: '.3s' }}>Nhã</span>{' '}
        <span className="name" style={{ animationDelay: '.45s' }}>Đan</span>
      </h1>
      <p className="sub">Cùng học toán thật vui nhé! 🌈</p>
      <button
        className="bigbtn"
        onClick={() => {
          sfx.click();
          speak('Xin chào Nhã Đan! Cùng học toán nhé!');
          onStart();
        }}
      >
        Bắt đầu ▶
      </button>
    </section>
  );
}

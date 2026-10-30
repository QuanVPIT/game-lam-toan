export default function Stars({ n, animate = false }) {
  return [0, 1, 2].map((i) => (
    <span
      key={i}
      className={i < n ? 'star-on' : 'star-off'}
      style={animate ? { animationDelay: `${0.2 + i * 0.25}s` } : undefined}
    >
      ★
    </span>
  ));
}

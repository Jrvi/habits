const Logo = () => (
  <div className="logo" aria-label="Habitisti logo">
    <svg
      width="44"
      height="44"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      {/* Tausta */}
      <circle cx="50" cy="50" r="48" style={{ fill: 'var(--accent)' }} />

      {/* H-kirjain */}
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="50"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill="white"
        dominantBaseline="middle"
      >
        H
      </text>
    </svg>

    <span className="logo-text">Habitisti</span>
  </div>
);

export default Logo;

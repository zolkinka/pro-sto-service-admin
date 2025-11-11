import './Logo.css';

export const Logo = () => (
  <div className="logo">
    <div className="logo__dots">
      <div className="logo__dot" />
      <div className="logo__dot" />
      <div className="logo__dot" />
    </div>
    <svg className="logo__text" viewBox="0 0 84 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fontFamily="Onest" fontSize="16" fontWeight="500" fill="#302F2D">просто</text>
    </svg>
  </div>
);

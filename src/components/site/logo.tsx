import { Link } from '@/i18n/navigation';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label="Jubilé">
      <svg
        viewBox="0 0 280 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-14 w-auto"
        role="img"
        aria-label="Jubilé"
      >
        {/* Stylized Menorah / 7-branched candelabrum */}
        <g>
          {/* Base */}
          <rect x="22" y="52" width="12" height="6" rx="2" fill="hsl(42 90% 55%)" />
          {/* Central stem */}
          <rect x="26" y="24" width="4" height="30" rx="2" fill="hsl(42 90% 55%)" />
          {/* Central flame */}
          <ellipse cx="28" cy="20" rx="5" ry="8" fill="hsl(42 90% 65%)" />
          <ellipse cx="28" cy="20" rx="3" ry="5" fill="hsl(42 100% 80%)" />
          {/* Left branches */}
          <rect x="16" y="30" width="16" height="3" rx="1.5" fill="hsl(42 90% 55%)" transform="rotate(-25 24 32)" />
          <rect x="10" y="24" width="14" height="3" rx="1.5" fill="hsl(42 90% 55%)" transform="rotate(-40 17 26)" />
          <rect x="6" y="18" width="12" height="3" rx="1.5" fill="hsl(42 90% 55%)" transform="rotate(-55 12 20)" />
          {/* Right branches */}
          <rect x="24" y="30" width="16" height="3" rx="1.5" fill="hsl(42 90% 55%)" transform="rotate(25 32 32)" />
          <rect x="28" y="24" width="14" height="3" rx="1.5" fill="hsl(42 90% 55%)" transform="rotate(40 35 26)" />
          <rect x="32" y="18" width="12" height="3" rx="1.5" fill="hsl(42 90% 55%)" transform="rotate(55 38 20)" />
          {/* Side flames */}
          <ellipse cx="14" cy="16" rx="3.5" ry="5.5" fill="hsl(42 90% 60%)" />
          <ellipse cx="8" cy="12" rx="3" ry="4.5" fill="hsl(42 90% 60%)" />
          <ellipse cx="3" cy="8" rx="2.5" ry="4" fill="hsl(42 90% 60%)" />
          <ellipse cx="42" cy="16" rx="3.5" ry="5.5" fill="hsl(42 90% 60%)" />
          <ellipse cx="48" cy="12" rx="3" ry="4.5" fill="hsl(42 90% 60%)" />
          <ellipse cx="53" cy="8" rx="2.5" ry="4" fill="hsl(42 90% 60%)" />
        </g>

        {/* Text Jubilé */}
        <text
          x="68"
          y="46"
          fontFamily="Georgia, 'Cormorant Garamond', serif"
          fontSize="42"
          fontWeight="600"
          fill="hsl(215 75% 12%)"
          letterSpacing="1"
        >
          Jubilé
        </text>

        {/* Subtle tagline */}
        <text
          x="68"
          y="56"
          fontFamily="system-ui, sans-serif"
          fontSize="9"
          fontWeight="500"
          fill="hsl(42 90% 45%)"
          letterSpacing="3"
          style={{ textTransform: 'uppercase' }}
        >
          TERRE SAINTE
        </text>
      </svg>
    </Link>
  );
}

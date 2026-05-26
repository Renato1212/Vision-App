export function FrontalSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      className={className}
      aria-hidden
    >
      <rect x="6" y="6" width="108" height="148" stroke="currentColor" strokeDasharray="2 3" opacity="0.5" />
      <path d="M60 28 C 42 28 32 44 32 64 C 32 84 40 102 60 110 C 80 102 88 84 88 64 C 88 44 78 28 60 28 Z" />
      <line x1="60" y1="28" x2="60" y2="110" opacity="0.35" strokeDasharray="1 2" />
      <line x1="32" y1="64" x2="88" y2="64" opacity="0.35" strokeDasharray="1 2" />
      <circle cx="48" cy="62" r="2.2" />
      <circle cx="72" cy="62" r="2.2" />
      <path d="M55 82 Q 60 86 65 82" />
      <line x1="50" y1="98" x2="70" y2="98" />
    </svg>
  );
}

export function ProfileSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      className={className}
      aria-hidden
    >
      <rect x="6" y="6" width="108" height="148" stroke="currentColor" strokeDasharray="2 3" opacity="0.5" />
      <path d="M40 28 C 30 28 28 44 30 60 L 32 72 L 30 80 C 28 88 32 96 40 100 L 50 102 L 56 112 L 50 120 L 42 124" />
      <path d="M50 64 L 64 60 L 70 66 L 64 72 L 56 72" />
      <path d="M56 80 L 64 82 L 66 86 L 60 90" />
      <path d="M52 96 Q 60 100 66 96" />
      <line x1="40" y1="64" x2="48" y2="64" opacity="0.35" strokeDasharray="1 2" />
      <circle cx="48" cy="64" r="1.8" />
    </svg>
  );
}

type MotionChipProps = {
  isPaused: boolean;
  onToggle: () => void;
  playLabel: string;
  pauseLabel: string;
  ariaPlay: string;
  ariaPause: string;
};

export function MotionChip({
  isPaused,
  onToggle,
  playLabel,
  pauseLabel,
  ariaPlay,
  ariaPause,
}: MotionChipProps) {
  return (
    <button
      type="button"
      className="motion-chip"
      onClick={onToggle}
      aria-pressed={isPaused}
      aria-label={isPaused ? ariaPlay : ariaPause}
      title={isPaused ? playLabel : pauseLabel}
    >
      {isPaused ? (
        <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.2 2.4v11.2L13.2 8 4.2 2.4Z" fill="currentColor" />
        </svg>
      ) : (
        <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3.2" y="2.8" width="3.2" height="10.4" rx="0.6" fill="currentColor" />
          <rect x="9.6" y="2.8" width="3.2" height="10.4" rx="0.6" fill="currentColor" />
        </svg>
      )}
      <span className="label">{isPaused ? playLabel : pauseLabel}</span>
    </button>
  );
}

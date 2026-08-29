import { resetCosmosHintState } from '#web/widgets/cosmos/lib/hint-state';

type HintsResetButtonProps = {
  label: string;
};

export function HintsResetButton({ label }: HintsResetButtonProps) {
  return (
    <button
      type="button"
      className="hints-reset"
      onClick={() => resetCosmosHintState()}
      aria-label={label}
      title={label}
    >
      <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3.2 3.2a5.6 5.6 0 0 1 9.1 1.3M12.8 12.8a5.6 5.6 0 0 1-9.1-1.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12.8 2.4v3.2h-3.2M3.2 13.6v-3.2h3.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

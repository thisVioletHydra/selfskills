import { useEffect, useId, useRef, useState } from 'react';
import '#app/features/resume-gate/resume-gate.css';

type ResumeGateProps = {
  busy?: boolean;
  error?: string | null;
  onContinue: (url: string) => void;
  onSkip: () => void;
};

export function ResumeGate({ busy = false, error = null, onContinue, onSkip }: ResumeGateProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="resume-gate" role="presentation">
      <form
        className="panel"
        aria-labelledby="resume-gate-title"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) {
            return;
          }
          onContinue(url);
        }}
      >
        <p className="tag">selfskills</p>
        <h1 id="resume-gate-title" className="title">
          Вставь ссылку на резюме
        </h1>
        <p className="sub">
          Пока бета: с сервера приедет демо. Потом — Prisma / GraphQL без костылей.
        </p>

        <label className="label" htmlFor={inputId}>
          Ссылка
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className="input"
          type="text"
          name="resumeUrl"
          inputMode="url"
          autoComplete="url"
          placeholder="https://hh.ru/resume/…"
          value={url}
          disabled={busy}
          onChange={(event) => setUrl(event.target.value)}
        />

        <div className="actions">
          <button type="submit" className="primary" disabled={busy}>
            <span>{busy ? 'Загрузка…' : 'Продолжить'}</span>
            {!busy && (
              <kbd className="hotkey" title="Enter">
                ⏎
              </kbd>
            )}
          </button>

          <button type="button" className="ghost" disabled={busy} onClick={onSkip}>
            Пропустить
          </button>
        </div>

        <p className="hint">Пропустить — сразу на визитку / вакансию.</p>
        {error !== null && error !== undefined && error !== '' && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

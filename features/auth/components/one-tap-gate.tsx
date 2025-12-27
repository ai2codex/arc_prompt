'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { startOneTap } from '@/features/auth/client';

type OneTapGateProps = {
  compact?: boolean;
  title?: string;
  description?: string;
  retryLabel?: string;
};

export function OneTapGate({
  compact = false,
  title = 'Sign in with Google One Tap',
  description = 'Attempting to open One Tap. If nothing appears, retry.',
  retryLabel = 'Retry One Tap',
}: OneTapGateProps) {
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const handlePromptNotification = useCallback(() => {
    if (mountedRef.current) {
      setError('Google One Tap was dismissed. Please enable it in your browser settings.');
    }
  }, []);

  const handleStartError = useCallback((err: unknown) => {
    if (mountedRef.current) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google One Tap failed. Please retry or enable it in your browser settings.',
      );
    }
  }, []);

  const trigger = useCallback(() => {
    void startOneTap({
      onPromptNotification: handlePromptNotification,
    }).catch(handleStartError);
  }, [handlePromptNotification, handleStartError]);

  useEffect(() => {
    void trigger();
    return () => {
      mountedRef.current = false;
    };
  }, [trigger]);

  return (
    <div>
      {!compact ? (
        <>
          <h1>{title}</h1>
          <p>{description}</p>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => {
          setError(null);
          trigger();
        }}
      >
        {retryLabel}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

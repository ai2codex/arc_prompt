'use client';

import { useCallback, useEffect, useState } from 'react';

import { startOneTap } from '@/features/auth/client';

export function OneTapGate() {
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(async () => {
    setError(null);
    try {
      await startOneTap();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'One Tap start failed');
    }
  }, []);

  useEffect(() => {
    void trigger();
  }, [trigger]);

  return (
    <div>
      <h1>Sign in with Google One Tap</h1>
      <p>Attempting to open One Tap. If nothing appears, retry.</p>
      <button type="button" onClick={() => void trigger()}>
        Retry One Tap
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

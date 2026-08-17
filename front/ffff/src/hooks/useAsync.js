import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Runs `fn` (an async function returning data) whenever `deps` change.
 * Guards against setting state after unmount / after a newer call has started.
 */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    fn()
      .then((res) => {
        if (id === callId.current) setData(res);
      })
      .catch((err) => {
        if (id === callId.current) setError(err);
      })
      .finally(() => {
        if (id === callId.current) setLoading(false);
      });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run, setData };
}

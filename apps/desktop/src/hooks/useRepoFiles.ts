import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

export function useRepoFiles(repoPath: string | undefined) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ path: string; files: string[] } | null>(null);

  useEffect(() => {
    if (!repoPath) {
      setFiles([]);
      setError(null);
      return;
    }

    if (cacheRef.current?.path === repoPath) {
      setFiles(cacheRef.current.files);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    invoke<string[]>("list_repo_files", { repoDir: repoPath })
      .then((result) => {
        if (cancelled) return;
        cacheRef.current = { path: repoPath, files: result };
        setFiles(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err));
        setFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repoPath]);

  const refresh = useCallback(() => {
    cacheRef.current = null;
    if (!repoPath) return;
    setLoading(true);
    setError(null);
    invoke<string[]>("list_repo_files", { repoDir: repoPath })
      .then((result) => {
        cacheRef.current = { path: repoPath, files: result };
        setFiles(result);
      })
      .catch((err) => {
        setError(String(err));
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, [repoPath]);

  return { files, loading, error, refresh };
}

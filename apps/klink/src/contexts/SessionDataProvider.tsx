import type { ReactNode } from "react";
import { SessionContext, type SessionContextValue } from "./SessionContext";

interface SessionDataProviderProps {
  pdsUrl?: string;
  did?: string;
  handle?: string;
  children: ReactNode;
}

/**
 * Provider for injecting session data from sources other than authentication
 * (e.g., router loader data for public profile pages)
 */
export function SessionDataProvider({
  pdsUrl,
  did,
  handle,
  children,
}: SessionDataProviderProps) {
  const value: SessionContextValue = {
    pdsUrl,
    did,
    endpoint: pdsUrl,
    handle,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

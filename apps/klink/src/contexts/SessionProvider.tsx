import { useAuth } from "@kpaste-app/atproto-auth";
import type { ReactNode } from "react";
import { SessionContext, type SessionContextValue } from "./SessionContext";

export function SessionProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const value: SessionContextValue = {
    pdsUrl: session?.endpoint.url,
    did: session?.did,
    endpoint: session?.endpoint.url,
    handle: session?.handle,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

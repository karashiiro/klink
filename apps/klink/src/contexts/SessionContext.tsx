import { createContext } from "react";

export interface SessionContextValue {
  pdsUrl?: string;
  did?: string;
  endpoint?: string;
  handle?: string;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

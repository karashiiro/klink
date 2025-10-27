import { useContext } from "react";
import {
  SessionContext,
  type SessionContextValue,
} from "../contexts/SessionContext";

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  // Return empty object if not within SessionProvider (e.g., public pages)
  if (context === null) {
    return {};
  }
  return context;
}

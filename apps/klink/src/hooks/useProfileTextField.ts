import { useAtom, type WritableAtom } from "jotai";
import { useState, useEffect, useCallback } from "react";

export interface UseProfileTextField {
  value: string;
  setValue: (value: string) => void;
  commitValue: () => void;
}

export function useProfileTextField<T extends string>(
  atom: WritableAtom<T, [newValue: T], void>,
): UseProfileTextField {
  const [atomValue, setAtomValue] = useAtom(atom);
  const [localValue, setLocalValue] = useState(atomValue);

  const commitValue = useCallback(() => {
    if (atomValue !== localValue) {
      setAtomValue(localValue);
    }
  }, [atomValue, localValue, setAtomValue]);

  // Sync local value when atom changes (e.g., when profile loads).
  // This is only intended to handle issues with syncing text input fields.
  useEffect(() => {
    setLocalValue(atomValue);
  }, [atomValue]);

  return {
    value: localValue,
    setValue: setLocalValue as (value: string) => void,
    commitValue,
  };
}

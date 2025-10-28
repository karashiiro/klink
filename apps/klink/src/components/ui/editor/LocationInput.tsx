import { useState, useEffect, type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Input } from "@tamagui/input";
import { locationAtom } from "../../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";

export function LocationInput() {
  const atomValue = useAtomValue(locationAtom);
  const setLocation = useSetAtom(locationAtom);
  const [localValue, setLocalValue] = useState(atomValue);

  // Sync local value when atom changes (e.g., when profile loads)
  useEffect(() => {
    setLocalValue(atomValue);
  }, [atomValue]);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setLocalValue((e.target as HTMLInputElement).value);

  const handleBlur = () => {
    if (localValue !== atomValue) {
      setLocation(localValue);
    }
  };

  return (
    <Input
      placeholder="Location (optional)"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      backgroundColor="$secondary"
      color="$textBody"
      borderColor="$border"
      size="$4"
    />
  );
}

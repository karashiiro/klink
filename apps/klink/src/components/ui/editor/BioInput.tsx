import { useState, useEffect, type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Input } from "@tamagui/input";
import { bioAtom } from "../../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";

export function BioInput() {
  const atomValue = useAtomValue(bioAtom);
  const setBio = useSetAtom(bioAtom);
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
      setBio(localValue);
    }
  };

  return (
    <Input
      placeholder="Bio (required)"
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

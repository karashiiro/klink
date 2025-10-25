import { useState, useEffect, type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Input } from "@tamagui/input";
import { nameAtom } from "../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";

export function NameInput() {
  const atomValue = useAtomValue(nameAtom);
  const setName = useSetAtom(nameAtom);
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
      setName(localValue);
    }
  };

  return (
    <Input
      placeholder="Name (optional)"
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

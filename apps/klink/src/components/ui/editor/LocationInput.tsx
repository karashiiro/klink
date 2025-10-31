import { type FormEvent } from "react";
import { Input } from "@tamagui/input";
import { locationAtom } from "../../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";
import { useProfileTextField } from "../../../hooks/useProfileTextField";

export function LocationInput() {
  const { value, setValue, commitValue } = useProfileTextField(locationAtom);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setValue((e.target as HTMLInputElement).value);

  return (
    <Input
      placeholder="Location (optional)"
      value={value}
      onChange={handleChange}
      onBlur={commitValue}
      size="$4"
    />
  );
}

import { type FormEvent } from "react";
import { Input } from "@tamagui/input";
import { nameAtom } from "../../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";
import { useProfileTextField } from "../../../hooks/useProfileTextField";

export function NameInput() {
  const { value, setValue, commitValue } = useProfileTextField(nameAtom);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setValue((e.target as HTMLInputElement).value);

  return (
    <Input
      placeholder="Name (optional)"
      value={value}
      onChange={handleChange}
      onBlur={commitValue}
      size="$4"
    />
  );
}

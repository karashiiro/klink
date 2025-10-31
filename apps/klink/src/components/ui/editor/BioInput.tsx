import { type FormEvent } from "react";
import { Input } from "@tamagui/input";
import { bioAtom } from "../../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";
import { useProfileTextField } from "../../../hooks/useProfileTextField";

export function BioInput() {
  const { value, setValue, commitValue } = useProfileTextField(bioAtom);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setValue((e.target as HTMLInputElement).value);

  return (
    <Input
      placeholder="Bio (required)"
      value={value}
      onChange={handleChange}
      onBlur={commitValue}
      size="$4"
    />
  );
}

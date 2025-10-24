import { type FormEvent } from "react";
import { useAtom } from "jotai";
import { Input } from "@tamagui/input";
import { nameAtom } from "../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";

export function NameInput() {
  const [name, setName] = useAtom(nameAtom);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setName((e.target as HTMLInputElement).value);

  return (
    <Input
      placeholder="Name (optional)"
      value={name}
      onChange={handleChange}
      backgroundColor="$secondary"
      color="$textBody"
      borderColor="$border"
      size="$4"
    />
  );
}

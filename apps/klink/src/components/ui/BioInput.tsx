import { type FormEvent } from "react";
import { useAtom } from "jotai";
import { Input } from "@tamagui/input";
import { bioAtom } from "../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";

export function BioInput() {
  const [bio, setBio] = useAtom(bioAtom);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setBio((e.target as HTMLInputElement).value);

  return (
    <Input
      placeholder="Bio (required)"
      value={bio}
      onChange={handleChange}
      backgroundColor="$secondary"
      color="$textBody"
      borderColor="$border"
      size="$4"
    />
  );
}

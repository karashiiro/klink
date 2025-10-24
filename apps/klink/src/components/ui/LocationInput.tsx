import { type FormEvent } from "react";
import { useAtom } from "jotai";
import { Input } from "@tamagui/input";
import { locationAtom } from "../../atoms/profile";
import type { TextInputChangeEvent } from "react-native";

export function LocationInput() {
  const [location, setLocation] = useAtom(locationAtom);

  const handleChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setLocation((e.target as HTMLInputElement).value);

  return (
    <Input
      placeholder="Location (optional)"
      value={location}
      onChange={handleChange}
      backgroundColor="$secondary"
      color="$textBody"
      borderColor="$border"
      size="$4"
    />
  );
}

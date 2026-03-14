import type { ChangeEventHandler } from "react";
import { LABELS } from "../../constants";
import { Input } from "../ui";

export interface SearchFieldProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: SearchFieldProps) {
  return (
    <Input
      label={LABELS.common.search}
      leadingIcon={<span>⌕</span>}
      onChange={onChange}
      placeholder={placeholder ?? LABELS.common.search}
      value={value}
    />
  );
}

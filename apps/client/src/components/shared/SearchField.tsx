import type { ChangeEventHandler } from "react";
import { LABELS } from "../../constants";
import { Input } from "../ui";

export interface SearchFieldProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  label?: string;
  hint?: string;
  autoComplete?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  hint,
  autoComplete,
}: SearchFieldProps) {
  return (
    <Input
      label={label ?? LABELS.common.search}
      leadingIcon={<span>⌕</span>}
      onChange={onChange}
      placeholder={placeholder ?? LABELS.common.search}
      value={value}
      hint={hint}
      autoComplete={autoComplete}
    />
  );
}

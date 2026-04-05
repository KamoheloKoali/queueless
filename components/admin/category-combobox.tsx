"use client";

import { useMemo, useState } from "react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type CategoryComboboxProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function CategoryCombobox({
  value,
  options,
  onChange,
  placeholder = "Select category",
  disabled = false,
}: CategoryComboboxProps) {
  const [inputValue, setInputValue] = useState(value);

  const normalizedOptions = useMemo(
    () =>
      Array.from(
        new Set(
          options
            .map((option) => option.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        ),
      ),
    [options],
  );

  const trimmedInput = inputValue.trim();
  const hasExactOption = normalizedOptions.some(
    (option) => option.toLowerCase() === trimmedInput.toLowerCase(),
  );

  return (
    <Combobox
      items={normalizedOptions}
      value={value || null}
      inputValue={inputValue}
      onValueChange={(selectedValue) => {
        const nextValue = String(selectedValue ?? "").trim();
        if (!nextValue) return;
        setInputValue(nextValue);
        onChange(nextValue);
      }}
      onInputValueChange={(nextInputValue) => {
        setInputValue(nextInputValue);
        if (nextInputValue.trim()) {
          onChange(nextInputValue.trim());
        }
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        className="h-10 rounded-md"
        showClear
        showTrigger
      />
      <ComboboxContent>
        <ComboboxEmpty>No matching category</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={String(item)} value={item}>
                {String(item)}
              </ComboboxItem>
            )}
          </ComboboxCollection>
          {trimmedInput && !hasExactOption ? (
            <ComboboxItem key={`new-${trimmedInput}`} value={trimmedInput}>
              Use &quot;{trimmedInput}&quot;
            </ComboboxItem>
          ) : null}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

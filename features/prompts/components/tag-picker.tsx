'use client';

import * as React from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Spinner } from '@/components/ui/spinner';
import { listTags } from '@/features/prompts/actions';
import { useDebouncedValue } from '@/hooks/use-debounce';
import type { ActionError } from '@/lib/action';
import { handleUnauthorizedResult } from '@/lib/action-client';
import { APP_ERROR_CODES } from '@/lib/errors';
import { cn } from '@/lib/ui';

type TagPickerProps = {
  value: string[];
  onChangeAction: (value: string[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
  disabled?: boolean;
  className?: string;
};

export function TagPicker({
  value,
  onChangeAction,
  placeholder = 'Search tags',
  allowCreate = false,
  disabled = false,
  className,
}: TagPickerProps) {
  const anchorRef = useComboboxAnchor();
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<ActionError | null>(null);

  const debouncedInput = useDebouncedValue(inputValue, 300);

  const fetchOptions = React.useCallback(async () => {
    setLoading(true);
    const result = await listTags({ query: debouncedInput, limit: 50 });
    if (!result.ok) {
      handleUnauthorizedResult(result);
      setError(result.error);
      setOptions([]);
      setLoading(false);
      return;
    }
    setError(null);
    setOptions(result.data.items.map((item) => item.name));
    setLoading(false);
  }, [debouncedInput]);

  React.useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  const normalizedInput = inputValue.trim().toLowerCase();
  const hasOption = options.includes(normalizedInput) || value.includes(normalizedInput);
  const authRequired = error?.code === APP_ERROR_CODES.UNAUTHORIZED;
  const errorMessage = error?.message ?? null;
  const canCreate = allowCreate && !authRequired;
  const showCreate = canCreate && normalizedInput.length > 0 && !hasOption;

  return (
    <div className={cn(className)}>
      <Combobox
        multiple
        value={value}
        onValueChange={(next) => onChangeAction(next)}
        onInputValueChange={(next) => setInputValue(next)}
        disabled={disabled}
      >
        <ComboboxChips ref={anchorRef}>
          {value.map((tag) => (
            <ComboboxChip key={tag}>{tag}</ComboboxChip>
          ))}
          <ComboboxChipsInput placeholder={placeholder} disabled={disabled} />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList>
            {loading ? (
              <div className="text-muted-foreground flex items-center gap-2 px-2 py-2 text-sm">
                <Spinner className="size-4" />
                Loading
              </div>
            ) : null}
            {errorMessage ? <ComboboxEmpty>{errorMessage}</ComboboxEmpty> : null}
            {!errorMessage && !loading && options.length === 0 ? (
              <ComboboxEmpty>No tags found</ComboboxEmpty>
            ) : null}
            {showCreate ? (
              <ComboboxItem value={normalizedInput} className="text-foreground">
                Create &quot;{normalizedInput}&quot;
              </ComboboxItem>
            ) : null}
            {options.map((tag) => (
              <ComboboxItem key={tag} value={tag}>
                {tag}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

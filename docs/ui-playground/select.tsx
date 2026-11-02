import React, { useId, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  placeholder?: string;
  size?: 'md' | 'sm';
  className?: string;
  disabled?: boolean;
  /** Visually hide the label; it is still announced to assistive tech. */
  hideLabel?: boolean;
}

/**
 * Custom dropdown (no native <select>). Built on a Radix Popover with a
 * `role="listbox"` panel so it can be styled to the design system while keeping
 * full keyboard support: ArrowUp/Down to move, Home/End, Enter/Space to pick,
 * Escape or Tab to close with focus returned to the trigger.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = '请选择',
  size = 'md',
  className = '',
  disabled = false,
  hideLabel = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const enabled = options.map((o, i) => ({ o, i })).filter(({ o }) => !o.disabled);

  function openList() {
    if (disabled) return;
    const current = options.findIndex((o) => o.value === value);
    setActive(current >= 0 ? current : (enabled[0]?.i ?? -1));
    setOpen(true);
  }

  function pick(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  }

  function move(delta: number) {
    if (!enabled.length) return;
    const pos = enabled.findIndex(({ i }) => i === active);
    const next = pos === -1 ? 0 : (pos + delta + enabled.length) % enabled.length;
    setActive(enabled[next].i);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActive(enabled[0]?.i ?? -1);
        break;
      case 'End':
        event.preventDefault();
        setActive(enabled[enabled.length - 1]?.i ?? -1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        pick(active);
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={(next) => (next ? openList() : setOpen(false))}>
      <Popover.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          disabled={disabled}
          onKeyDown={onKeyDown}
          className={`pg-select pg-select-${size} ${className}`}
          data-open={open || undefined}
        >
          <span className={selected ? '' : 'pg-select-placeholder'}>{selected?.label ?? placeholder}</span>
          <ChevronDown aria-hidden="true" className="pg-select-chevron" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="pg-select-panel"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            className="pg-select-list"
            onKeyDown={onKeyDown}
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              const isActive = i === active;
              return (
                <div
                  key={option.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-active={isActive || undefined}
                  className="pg-select-option"
                  onMouseEnter={() => !option.disabled && setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(i)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check aria-hidden="true" />}
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

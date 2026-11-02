import React from 'react';

export interface PillOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PillGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: PillOption[];
  className?: string;
}

/**
 * Segmented pill group. The selected state is an inset ring drawn inside each
 * pill's own 44px box, and pills sit in a flex row with a real gap, so the
 * highlight can never bleed onto a neighbouring control.
 * Keyboard: Arrow keys move selection (roving tabindex), Home/End jump.
 */
export function PillGroup({ label, value, onChange, options, className = '' }: PillGroupProps) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const enabled = options.map((o, i) => ({ o, i })).filter(({ o }) => !o.disabled);

  function focusIndex(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    refs.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const pos = enabled.findIndex(({ i }) => i === index);
    if (pos === -1) return;
    let next: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length].i;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = enabled[(pos - 1 + enabled.length) % enabled.length].i;
    if (event.key === 'Home') next = enabled[0].i;
    if (event.key === 'End') next = enabled[enabled.length - 1].i;
    if (next !== undefined) {
      event.preventDefault();
      focusIndex(next);
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className={`pg-pills ${className}`}>
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={option.disabled}
            data-selected={selected || undefined}
            className="pg-pill"
            onClick={() => focusIndex(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import React, { useLayoutEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';

/**
 * Measures the active item inside a container and returns the pixel box the
 * sliding indicator should occupy. Re-measures on activation change and on
 * container resize so the indicator stays aligned across breakpoints.
 */
export function useSlidingIndicator<T extends HTMLElement>(activeKey: string, axis: 'x' | 'y' = 'x') {
  const containerRef = useRef<T | null>(null);
  const [box, setBox] = useState<{ offset: number; size: number; ready: boolean }>({
    offset: 0,
    size: 0,
    ready: false,
  });
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const target = el.querySelector<HTMLElement>('[data-slide-active="true"]');
      if (!target) return;
      const offset = axis === 'x' ? target.offsetLeft : target.offsetTop;
      const size = axis === 'x' ? target.offsetWidth : target.offsetHeight;
      setBox((prev) =>
        prev.offset === offset && prev.size === size && prev.ready ? prev : { offset, size, ready: true },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeKey, axis]);
  return { containerRef, box };
}
export type InteractiveState =
  'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'success' | 'error';
export function Button({
  variant = 'secondary',
  loading = false,
  stateOverride = 'default',
  className = '',
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  loading?: boolean;
  stateOverride?: InteractiveState;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading || stateOverride === 'disabled' || stateOverride === 'loading'}
      aria-busy={loading || stateOverride === 'loading' || undefined}
      data-state={stateOverride}
      className={`btn btn-${variant} ${className}`}
    >
      {(loading || stateOverride === 'loading') && <Loader2 className="spin" />}
      {stateOverride === 'success' && <Check />}
      {stateOverride === 'error' && <AlertCircle />}
      {children}
    </button>
  );
}
export function Overlay({
  title,
  description,
  trigger,
  children,
  drawer = false,
  open,
  onOpenChange,
}: {
  title: string;
  description: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  drawer?: boolean;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-backdrop" />
        <Dialog.Content className={`overlay-panel ${drawer ? 'drawer-panel' : ''}`}>
          <div className="row between">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" aria-label="关闭弹窗">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted">{description}</Dialog.Description>
          <div className="overlay-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState('复制');
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState('已复制');
        } catch {
          setState('复制失败，请手动选择');
        }
        setTimeout(() => setState('复制'), 2000);
      }}
    >
      {state}
    </Button>
  );
}

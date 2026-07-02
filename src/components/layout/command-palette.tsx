'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

const defaultCommands: CommandItem[] = [
  { id: 'dashboard', label: 'Go to Dashboard', description: 'View main metrics and controls', href: '/' },
  { id: 'workflow', label: 'Open Workflow Graph', description: 'Visualize execution plan', href: '/flow' },
  { id: 'timeline', label: 'View Timeline', description: 'See all events in chronological order', href: '/timeline' },
  { id: 'analytics', label: 'Open Analytics', description: 'View charts and metrics', href: '/analytics' },
  { id: 'simulation', label: 'Open Simulation Center', description: 'Trigger environmental events', href: '/simulation' },
  { id: 'theme', label: 'Toggle Dark Mode', description: 'Switch between light and dark themes', action: () => document.documentElement.classList.toggle('dark') },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  extraCommands?: CommandItem[];
}

export function CommandPalette({ isOpen, onClose, extraCommands = [] }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allCommands = [...defaultCommands, ...extraCommands];
  const filtered = allCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      if (cmd.action) {
        cmd.action();
      } else if (cmd.href) {
        router.push(cmd.href);
      }
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    },
    [filtered, selectedIndex, executeCommand]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border bg-background shadow-2xl'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => executeCommand(cmd)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                i === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{cmd.label}</p>
                <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
              </div>
              {cmd.shortcut && (
                <kbd className="shrink-0 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

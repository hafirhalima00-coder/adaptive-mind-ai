'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function PulseRing({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-3 w-3', className)}>
      <motion.span
        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
    </span>
  );
}

export function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'down' | 'idle' | 'running' | 'completed' | 'failed' }) {
  const colors = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
    idle: 'bg-slate-400',
    running: 'bg-blue-500',
    completed: 'bg-emerald-500',
    failed: 'bg-red-500',
  };

  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        colors[status],
        status === 'running' && 'animate-pulse'
      )}
    />
  );
}

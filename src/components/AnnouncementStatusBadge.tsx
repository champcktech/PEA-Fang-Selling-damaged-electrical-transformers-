import { CheckCircle2, Clock } from 'lucide-react';
import { AnnouncementStatusInfo } from '../data/transformers';

interface AnnouncementStatusBadgeProps {
  status: AnnouncementStatusInfo;
  size?: 'sm' | 'md';
}

export function AnnouncementStatusBadge({
  status,
  size = 'md',
}: AnnouncementStatusBadgeProps) {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-1.5';

  if (status.key === 'active') {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-md border bg-emerald-50 text-emerald-800 border-emerald-300 whitespace-nowrap shrink-0 ${sizeClasses}`}
      >
        <span
          className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"
          aria-hidden="true"
        />
        <span>{status.label}</span>
      </span>
    );
  }

  if (status.key === 'ended') {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-md border bg-slate-100 text-slate-700 border-slate-300 whitespace-nowrap shrink-0 ${sizeClasses}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
        <span>{status.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border bg-amber-50 text-amber-900 border-amber-300 whitespace-nowrap shrink-0 ${sizeClasses}`}
    >
      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
      <span>{status.label}</span>
    </span>
  );
}

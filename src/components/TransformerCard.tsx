import { AlertTriangle, Eye } from 'lucide-react';
import { TransformerUnit, formatThb } from '../data/transformers';
import { ResilientImage } from './ResilientImage';

interface TransformerCardProps {
  unit: TransformerUnit;
  onInspect: (unit: TransformerUnit) => void;
}

export function TransformerCard({ unit, onInspect }: TransformerCardProps) {
  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
      <button
        type="button"
        onClick={() => onInspect(unit)}
        className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-600"
        aria-label={`ดูรายละเอียดและรูปภาพ ${unit.title}`}
      >
        <ResilientImage
          src={unit.images[0]?.url || ''}
          alt={`${unit.title} — ${unit.lotCode}`}
          fallbackTitle={unit.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded text-xs font-mono font-medium tabular-nums">
          {unit.lotCode}
        </div>
        {unit.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded text-xs font-mono tabular-nums border border-slate-200/80">
            {unit.images.length} รูป
          </div>
        )}
      </button>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 truncate">
          <span className="font-mono text-slate-700 font-medium">{unit.peaAssetNo}</span>
          <span aria-hidden="true">·</span>
          <span>{unit.typeLabelTh}</span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2">
          <button
            type="button"
            onClick={() => onInspect(unit)}
            className="text-left hover:text-amber-700 transition-colors cursor-pointer"
          >
            {unit.title}
          </button>
        </h3>

        <div className="text-xs text-slate-600 font-mono tabular-nums space-y-1 mb-3">
          <p className="truncate">
            ปี {unit.year} · {unit.vectorGroup} · {unit.phase} · น้ำหนัก{' '}
            {unit.weightKg.toLocaleString('th-TH')} กก.
          </p>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-amber-900 font-medium mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="line-clamp-2">{unit.damageDetail}</span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {unit.summaryNote}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">
              ราคาตั้งขายตามสภาพ · จำนวน{' '}
              <span className="font-mono font-medium text-slate-800 tabular-nums">
                {unit.stockQty}
              </span>{' '}
              เครื่อง
            </p>
            <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
              {formatThb(unit.priceThb)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onInspect(unit)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>ดูรายละเอียด</span>
          </button>
        </div>
      </div>
    </article>
  );
}

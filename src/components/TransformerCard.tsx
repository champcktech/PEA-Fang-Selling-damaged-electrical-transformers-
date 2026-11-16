import { Eye } from 'lucide-react';
import {
  AnnouncementStatusInfo,
  TRANSFORMER_WATERMARK_TEXT,
  TransformerUnit,
} from '../data/transformers';
import { AnnouncementStatusBadge } from './AnnouncementStatusBadge';
import { ResilientImage } from './ResilientImage';

interface TransformerCardProps {
  unit: TransformerUnit;
  announcementStatus?: AnnouncementStatusInfo;
  onInspect: (unit: TransformerUnit) => void;
}

export function TransformerCard({
  unit,
  announcementStatus,
  onInspect,
}: TransformerCardProps) {
  const cardTitle = `หม้อแปลงขนาด ${unit.kva.toLocaleString('th-TH')} kVA · ${unit.phase}`;

  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
      <button
        type="button"
        onClick={() => onInspect(unit)}
        className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-600"
        aria-label={`ดูรายละเอียดและรูปภาพ PEA No. ${unit.peaNo}`}
      >
        <ResilientImage
          src={unit.images[0]?.url || ''}
          alt={`${cardTitle} (${unit.peaNo})`}
          fallbackTitle={`PEA No. ${unit.peaNo}`}
          watermarkText={TRANSFORMER_WATERMARK_TEXT}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded text-xs font-mono font-medium tabular-nums">
          {unit.lotCode}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded text-xs font-mono tabular-nums border border-slate-200/80">
          {unit.images.length} รูป
        </div>
      </button>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-xs font-mono text-amber-800 font-semibold truncate">
            PEA No. {unit.peaNo}
          </p>
          {announcementStatus && (
            <AnnouncementStatusBadge status={announcementStatus} size="sm" />
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2">
          <button
            type="button"
            onClick={() => onInspect(unit)}
            className="text-left hover:text-amber-700 transition-colors cursor-pointer"
          >
            {cardTitle}
          </button>
        </h3>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
          {unit.summaryNote}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">จำนวนในประกาศ</p>
            <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
              {unit.stockQty} เครื่อง
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

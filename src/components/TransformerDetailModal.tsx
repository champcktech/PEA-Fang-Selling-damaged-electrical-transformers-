import { useEffect, useState } from 'react';
import { Calendar, Check, Clock, Copy, Gavel, X } from 'lucide-react';
import {
  PHOTO_SLOT_LABELS,
  TransformerLot,
  TransformerUnit,
  formatThaiDateTime,
} from '../data/transformers';
import { ResilientImage } from './ResilientImage';

interface TransformerDetailModalProps {
  unit: TransformerUnit | null;
  lot?: TransformerLot | null;
  onClose: () => void;
}

export function TransformerDetailModal({
  unit,
  lot,
  onClose,
}: TransformerDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedSpec, setCopiedSpec] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setCopiedSpec(false);
  }, [unit?.id]);

  useEffect(() => {
    if (!unit) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [unit, onClose]);

  if (!unit) return null;

  const activeImage = unit.images[activeImageIdx] || unit.images[0];
  const headingTitle = `หม้อแปลงขนาด ${unit.kva.toLocaleString('th-TH')} kVA · ${unit.phase}`;

  const handleCopySpec = async () => {
    const specText = [
      `PEA No.: ${unit.peaNo} (${unit.lotCode})`,
      `พิกัดกำลังไฟฟ้า: ${unit.kva.toLocaleString('th-TH')} kVA (${unit.phase})`,
      `จำนวน: ${unit.stockQty} เครื่อง`,
      `รายละเอียดเพิ่มเติม: ${unit.summaryNote}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(specText);
      setCopiedSpec(true);
      setTimeout(() => setCopiedSpec(false), 2000);
    } catch {
      setCopiedSpec(false);
    }
  };

  const specs: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: 'PEA No.', value: unit.peaNo, mono: true },
    { label: 'ประกาศขาย', value: unit.lotCode },
    { label: 'พิกัดกำลังไฟฟ้า', value: `${unit.kva.toLocaleString('th-TH')} kVA`, mono: true },
    { label: 'จำนวนเฟส', value: unit.phase, mono: true },
    { label: 'จำนวนในประกาศ', value: `${unit.stockQty} เครื่อง`, mono: true },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-transformer-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
            <span className="font-mono font-semibold text-slate-900 whitespace-nowrap">
              {unit.peaNo}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{unit.lotCode}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่างรายละเอียด"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: 3-Angle Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <ResilientImage
                  src={activeImage?.url || ''}
                  alt={activeImage?.caption || headingTitle}
                  fallbackTitle={`PEA No. ${unit.peaNo}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-slate-700 font-semibold">
                {activeImage?.caption || PHOTO_SLOT_LABELS[activeImageIdx] || ''}
              </p>

              <div className="grid grid-cols-3 gap-3">
                {unit.images.map((img, index) => (
                  <button
                    key={`${unit.id}-img-${index}`}
                    type="button"
                    onClick={() => setActiveImageIdx(index)}
                    className={`flex flex-col text-left rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 ${
                      activeImageIdx === index
                        ? 'border-amber-600 ring-2 ring-amber-600/20'
                        : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <ResilientImage
                        src={img.url}
                        alt={img.caption || PHOTO_SLOT_LABELS[index] || `มุมภาพ ${index + 1}`}
                        fallbackTitle={PHOTO_SLOT_LABELS[index] || `มุมภาพ ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="px-2 py-1.5 text-[11px] font-medium text-slate-700 truncate w-full">
                      {img.caption || PHOTO_SLOT_LABELS[index]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: View-only Details */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-mono font-semibold text-amber-800 mb-1">
                    PEA No. {unit.peaNo}
                  </p>
                  <h2
                    id="modal-transformer-title"
                    className="font-display text-2xl font-bold text-slate-900 leading-tight"
                  >
                    {headingTitle}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCopySpec}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedSpec ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                      <span>คัดลอกข้อมูลแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>คัดลอกรายละเอียดย่อ</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                ข้อมูลหม้อแปลงเบื้องต้น
              </h3>

              <dl className="divide-y divide-slate-100 border-y border-slate-200 text-sm mb-6">
                {specs.map((row) => (
                  <div
                    key={row.label}
                    className="py-3 grid grid-cols-12 gap-3 items-baseline"
                  >
                    <dt className="col-span-5 text-slate-500 text-xs sm:text-sm">
                      {row.label}
                    </dt>
                    <dd
                      className={`col-span-7 text-slate-900 font-medium text-right ${
                        row.mono ? 'font-mono tabular-nums text-xs sm:text-sm' : ''
                      }`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                <h4 className="text-xs font-semibold text-slate-800 mb-1.5">
                  รายละเอียดเพิ่มเติม
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {unit.summaryNote}
                </p>
              </div>

              {lot && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 mb-6 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-950">
                    กำหนดการของประกาศนี้
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                        วันที่เริ่ม
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatThaiDateTime(lot.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                        วันที่สุดท้าย
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatThaiDateTime(lot.endDate)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold">
                        <Gavel className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                        วันที่เปิดซอง
                      </span>
                      <span className="font-mono text-sm font-bold text-amber-950 tabular-nums">
                        {formatThaiDateTime(lot.bidOpeningAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  ปิดหน้าต่างรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

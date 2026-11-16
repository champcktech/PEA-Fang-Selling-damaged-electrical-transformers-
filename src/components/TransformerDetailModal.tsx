import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, X } from 'lucide-react';
import { TransformerUnit, formatThb } from '../data/transformers';
import { ResilientImage } from './ResilientImage';

interface TransformerDetailModalProps {
  unit: TransformerUnit | null;
  onClose: () => void;
}

export function TransformerDetailModal({
  unit,
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

  const handleCopySpec = async () => {
    const specText = [
      `${unit.title} (${unit.lotCode} / รหัสทรัพย์สิน: ${unit.peaAssetNo})`,
      `ยี่ห้อ: ${unit.brand} · ปีผลิต: ${unit.year}`,
      `ชนิด: ${unit.typeLabelTh} · สภาพ: ${unit.condition}`,
      `อาการชำรุด: ${unit.damageDetail}`,
      `พิกัด: ${unit.kva.toLocaleString('th-TH')} kVA · แรงดัน: ${unit.primaryVoltage} / ${unit.secondaryVoltage}`,
      `Vector Group: ${unit.vectorGroup} · ความถี่: ${unit.frequency} · ${unit.phase}`,
      `ขนาด: ${unit.dimensionsMm} · น้ำหนัก: ${unit.weightKg.toLocaleString('th-TH')} กก.`,
      `ราคาตั้งขายตามสภาพ: ${formatThb(unit.priceThb)} (จำนวน ${unit.stockQty} เครื่อง)`,
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
    { label: 'รหัสทรัพย์สิน กฟภ.', value: unit.peaAssetNo, mono: true },
    { label: 'รหัสรายการ / ล็อต', value: `${unit.sku} · ${unit.lotCode}`, mono: true },
    { label: 'ผู้ผลิต / ยี่ห้อ', value: unit.brand },
    { label: 'ชนิดหม้อแปลง', value: unit.typeLabelTh },
    { label: 'พิกัดกำลังไฟฟ้า', value: `${unit.kva.toLocaleString('th-TH')} kVA`, mono: true },
    { label: 'แรงดันด้านสูง / ต่ำ', value: `${unit.primaryVoltage} / ${unit.secondaryVoltage}`, mono: true },
    { label: 'Vector Group / เฟส', value: `${unit.vectorGroup} · ${unit.phase} · ${unit.frequency}`, mono: true },
    { label: 'ระบบระบายความร้อน', value: unit.cooling },
    { label: 'ปีที่ผลิต', value: `${unit.year}`, mono: true },
    { label: 'ขนาด (ก × ย × ส)', value: unit.dimensionsMm, mono: true },
    { label: 'น้ำหนักรวมโดยประมาณ', value: `${unit.weightKg.toLocaleString('th-TH')} กก.`, mono: true },
    { label: 'จำนวนในล็อต', value: `${unit.stockQty} เครื่อง`, mono: true },
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
              {unit.lotCode}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{unit.condition}</span>
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
            {/* Left: Multi-image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <ResilientImage
                  src={activeImage?.url || ''}
                  alt={activeImage?.caption || unit.title}
                  fallbackTitle={unit.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {activeImage?.caption && (
                <p className="text-xs text-slate-600 font-medium">
                  คำอธิบายภาพ: {activeImage.caption}
                </p>
              )}

              {unit.images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {unit.images.map((img, index) => (
                    <button
                      key={`${unit.id}-img-${index}`}
                      type="button"
                      onClick={() => setActiveImageIdx(index)}
                      className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIdx === index
                          ? 'border-amber-600 ring-2 ring-amber-600/20'
                          : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <ResilientImage
                        src={img.url}
                        alt={img.caption}
                        fallbackTitle={`มุมภาพ ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  หมายเหตุสภาพเครื่องเพิ่มเติม
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {unit.summaryNote}
                </p>
              </div>
            </div>

            {/* Right: View-only Technical Details */}
            <div className="lg:col-span-6 flex flex-col">
              <h2
                id="modal-transformer-title"
                className="font-display text-2xl font-bold text-slate-900 leading-tight mb-3"
              >
                {unit.title}
              </h2>

              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-sm text-amber-950 mb-5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-xs text-amber-900">
                    สภาพความชำรุดที่ตรวจพบ ({unit.condition})
                  </p>
                  <p className="text-sm font-medium mt-0.5">{unit.damageDetail}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 mb-5 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    ราคาตั้งขายตามสภาพ (ต่อเครื่อง)
                  </p>
                  <p className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                    {formatThb(unit.priceThb)}
                  </p>
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
                ข้อมูลจำเพาะหม้อแปลงเบื้องต้น
              </h3>

              <dl className="divide-y divide-slate-100 border-y border-slate-200 text-sm mb-6">
                {specs.map((row) => (
                  <div
                    key={row.label}
                    className="py-2.5 grid grid-cols-12 gap-3 items-baseline"
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

import { ArrowDown } from 'lucide-react';
import { HERO_IMAGE } from '../data/transformers';
import { ResilientImage } from './ResilientImage';

interface HeroProps {
  totalUnitsCount: number;
  totalLotsCount: number;
}

export function Hero({ totalUnitsCount, totalLotsCount }: HeroProps) {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-xs font-mono font-medium text-amber-700 tracking-wide mb-3">
              ลานพัสดุ กฟส.ฝาง · อ.ฝาง จ.เชียงใหม่ · จำหน่ายตามสภาพ
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-[1.2] tracking-tight text-balance mb-4">
              รายละเอียดหม้อแปลงขาย เก่าชำรุด กฟส.ฝาง
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl mb-6">
              รวบรวมข้อมูลหม้อแปลงไฟฟ้าเก่าและชำรุดที่รอจำหน่ายในพื้นที่ กฟส.ฝาง
              จัดแยกตามประกาศอย่างเป็นระบบ พร้อมแสดงรายละเอียดเบื้องต้น หมายเลข PEA No.
              และรูปภาพประกอบสำหรับผู้ที่สนใจเข้าชมได้ทันที
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#lots"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 whitespace-nowrap shrink-0"
              >
                <span>เลือกดูหม้อแปลงตามประกาศ</span>
                <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <ResilientImage
                src={HERO_IMAGE}
                alt="ลานหม้อแปลง คงคลัง กฟส.ฝาง ณ คลังพัสดุการไฟฟ้าส่วนภูมิภาคสาขาฝาง"
                fallbackTitle="ลานพัสดุหม้อแปลง กฟส.ฝาง"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-7 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">จำนวนประกาศที่เปิดให้ชมข้อมูล</p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {totalLotsCount} ประกาศ ({totalUnitsCount} เครื่อง)
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">ช่วงพิกัดกำลังไฟฟ้า</p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              50 – 1,000 kVA
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">ลักษณะสินค้า</p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              เก่า / ชำรุดตามสภาพ
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">สถานที่ดูสภาพจริง</p>
            <p className="font-mono text-lg sm:text-xl font-semibold text-slate-900">
              ลานพัสดุ กฟส.ฝาง
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

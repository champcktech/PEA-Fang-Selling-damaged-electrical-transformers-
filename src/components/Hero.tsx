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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-mono font-medium text-amber-700 tracking-wide mb-3">
              ลานพัสดุ กฟส.ฝาง · อ.ฝาง จ.เชียงใหม่ · จำหน่ายตามสภาพ
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-slate-900 leading-[1.2] tracking-tight text-balance mb-5">
              รายละเอียดหม้อแปลงขาย เก่าชำรุด กฟส.ฝาง
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl mb-7">
              รวบรวมข้อมูลหม้อแปลงไฟฟ้าเก่าและชำรุดที่รอจำหน่ายในพื้นที่ กฟส.ฝาง
              จัดแยกตามล็อตอย่างเป็นระบบ พร้อมแสดงรายละเอียดทางเทคนิคเบื้องต้น
              รหัสทรัพย์สิน อาการชำรุด และรูปภาพประกอบสำหรับผู้ที่สนใจเข้าชมได้ทันที
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#lots"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 whitespace-nowrap shrink-0"
              >
                <span>เลือกดูหม้อแปลงแยกตามล็อต</span>
                <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-64 sm:h-80 lg:h-full min-h-[280px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <ResilientImage
                src={HERO_IMAGE}
                alt="ภาพรวมหม้อแปลงไฟฟ้าเก่าชำรุดที่จัดเก็บรอจำหน่าย ณ กฟส.ฝาง"
                fallbackTitle="ลานพัสดุหม้อแปลง กฟส.ฝาง"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">จำนวนล็อตที่เปิดให้ชมข้อมูล</p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {totalLotsCount} ล็อต ({totalUnitsCount} เครื่อง)
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
            <p className="text-xs text-slate-500 mb-1">พิกัดระบบแรงดัน</p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              22 kV / 400 V · Dyn11
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

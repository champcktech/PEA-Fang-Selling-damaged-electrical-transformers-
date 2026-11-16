import { useMemo, useState } from 'react';
import { Building2, Calendar, Clock, Gavel, MapPin, Phone, Search } from 'lucide-react';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TransformerCard } from './components/TransformerCard';
import { TransformerDetailModal } from './components/TransformerDetailModal';
import { useFirebase } from './contexts/FirebaseContext';
import {
  TransformerLot,
  TransformerUnit,
  formatThaiDateTime,
} from './data/transformers';

type SortOption = 'kva-desc' | 'kva-asc' | 'pea-asc';

export default function App() {
  const { lots, units } = useFirebase();

  const [selectedLotId, setSelectedLotId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('kva-desc');

  const [inspectedUnit, setInspectedUnit] = useState<TransformerUnit | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const totalStockUnits = useMemo(
    () => units.reduce((sum, u) => sum + u.stockQty, 0),
    [units]
  );

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = units.filter((unit) => {
      if (selectedLotId !== 'all' && unit.lotId !== selectedLotId) return false;
      if (q) {
        const haystack =
          `${unit.peaNo} ${unit.lotCode} ${unit.kva} kva ${unit.phase} ${unit.summaryNote}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'kva-desc') return b.kva - a.kva;
      if (sortBy === 'kva-asc') return a.kva - b.kva;
      return a.peaNo.localeCompare(b.peaNo);
    });
  }, [units, selectedLotId, searchQuery, sortBy]);

  const groupedByLot = useMemo(() => {
    const groups: Array<{ lot: TransformerLot; units: TransformerUnit[] }> = [];
    for (const lot of lots) {
      if (selectedLotId !== 'all' && lot.id !== selectedLotId) continue;
      const lotUnits = filteredUnits.filter((u) => u.lotId === lot.id);
      if (lotUnits.length > 0) {
        groups.push({ lot, units: lotUnits });
      }
    }
    return groups;
  }, [lots, filteredUnits, selectedLotId]);

  const handleClearFilters = () => {
    setSelectedLotId('all');
    setSearchQuery('');
    setSortBy('kva-desc');
  };

  const handleJumpToLots = () => {
    setSelectedLotId('all');
    document.getElementById('lots')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900">
      <Header onJumpToLots={handleJumpToLots} />

      <main className="flex-1">
        <Hero totalLotsCount={lots.length} totalUnitsCount={totalStockUnits} />

        <section id="lots" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          {/* Section Header & Lot Selector */}
          <div className="mb-8 space-y-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-medium text-amber-700 mb-1.5">
                  ข้อมูลหม้อแปลงเก่าชำรุดแยกตามประกาศ
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  เลือกชมรายละเอียดหม้อแปลงตามประกาศ
                </h2>
              </div>
              <p className="text-sm text-slate-600 font-mono tabular-nums">
                แสดง {filteredUnits.length} รายการ จากทั้งหมด {units.length} รายการ
              </p>
            </div>

            {/* Interactive Announcement Filter Tabs */}
            <div
              role="tablist"
              aria-label="ตัวเลือกประกาศขายหม้อแปลงไฟฟ้า"
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedLotId === 'all'}
                onClick={() => setSelectedLotId('all')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedLotId === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({lots.length} ประกาศ)
              </button>
              {lots.map((lot) => (
                <button
                  key={lot.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedLotId === lot.id}
                  onClick={() => setSelectedLotId(lot.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedLotId === lot.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lot.shortLabel}
                </button>
              ))}
            </div>

            {/* Search & Sort Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาตาม PEA No. (TRxx-xxxxxx), ขนาด kVA หรือรายละเอียด..."
                  aria-label="ค้นหาหม้อแปลงไฟฟ้า"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-amber-600"
                />
              </div>

              <div className="md:col-span-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="เรียงลำดับรายการ"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-2 focus:outline-amber-600 cursor-pointer"
                >
                  <option value="kva-desc">เรียงตามพิกัด: kVA สูง → ต่ำ</option>
                  <option value="kva-asc">เรียงตามพิกัด: kVA ต่ำ → สูง</option>
                  <option value="pea-asc">เรียงตาม PEA No. (น้อย → มาก)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lot Sections & Product Grid */}
          <div id="catalog" className="space-y-12">
            {groupedByLot.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <p className="text-base font-semibold text-slate-900 mb-1">
                  ไม่พบหม้อแปลงที่ตรงกับเงื่อนไขการค้นหา
                </p>
                <p className="text-sm text-slate-500 mb-5">
                  ลองเปลี่ยนคำค้นหาหรือรีเซ็ตตัวกรองเพื่อแสดงหม้อแปลงทุกประกาศ
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              groupedByLot.map(({ lot, units: lotUnits }) => {
                const lotStockSum = lotUnits.reduce((sum, u) => sum + u.stockQty, 0);
                return (
                  <div key={lot.id} className="space-y-5">
                    {/* Lot Header Bar */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-slate-500">
                            {lot.sourceLocation}
                          </p>
                          <h3 className="font-display text-xl font-bold text-slate-900">
                            {lot.shortLabel}
                          </h3>
                          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                            {lot.description}
                          </p>
                        </div>

                        <div className="text-left lg:text-right shrink-0">
                          <p className="text-xs text-slate-500 font-mono tabular-nums">
                            รวม {lotUnits.length} รายการ · {lotStockSum} เครื่อง
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 sm:p-4 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-slate-200/80 text-slate-800 shrink-0">
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600">
                              วันที่เริ่ม
                            </p>
                            <p className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5 leading-snug">
                              {formatThaiDateTime(lot.startDate)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 sm:p-4 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-slate-200/80 text-slate-800 shrink-0">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600">
                              วันที่สุดท้าย
                            </p>
                            <p className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5 leading-snug">
                              {formatThaiDateTime(lot.endDate)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3.5 sm:p-4 flex items-start gap-3 ring-1 ring-amber-200/70">
                          <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0">
                            <Gavel className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-amber-900">
                              วันที่เปิดซอง
                            </p>
                            <p className="font-mono text-sm sm:text-base font-bold text-amber-950 tabular-nums mt-0.5 leading-snug">
                              {formatThaiDateTime(lot.bidOpeningAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3-Column Transformer Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {lotUnits.map((unit) => (
                        <TransformerCard
                          key={unit.id}
                          unit={unit}
                          onInspect={setInspectedUnit}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section id="contact" className="bg-white border-t border-slate-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-xs font-mono font-medium text-amber-700 mb-1">
                ข้อมูลติดต่อหน่วยงาน
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                แผนกมิเตอร์และหม้อแปลง การไฟฟ้าส่วนภูมิภาคสาขาฝาง
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <Building2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">หน่วยงานรับผิดชอบ</p>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    แผนกมิเตอร์และหม้อแปลง การไฟฟ้าส่วนภูมิภาคสาขาฝาง
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">ที่อยู่</p>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    343 หมู่ 4 ตำบลเวียง อำเภอฝาง จังหวัดเชียงใหม่ 50110
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">โทรศัพท์ติดต่อ</p>
                  <a
                    href="tel:053452170"
                    className="font-mono text-base font-bold text-slate-900 hover:text-amber-700 transition-colors tabular-nums"
                  >
                    053452170
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            รายละเอียดหม้อแปลงขาย เก่าชำรุด กฟส.ฝาง · ข้อมูลเพื่อการเข้าชมรายละเอียดเบื้องต้นและรูปภาพประกอบ
          </p>
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            จัดการฐานข้อมูล (สำหรับเจ้าหน้าที่)
          </button>
        </div>
      </footer>

      <TransformerDetailModal
        unit={inspectedUnit}
        lot={lots.find((l) => l.id === inspectedUnit?.lotId) || null}
        onClose={() => setInspectedUnit(null)}
      />

      <AdminConsoleModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}

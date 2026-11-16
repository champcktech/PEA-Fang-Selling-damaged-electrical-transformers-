interface HeaderProps {
  onJumpToLots: () => void;
}

export function Header({ onJumpToLots }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#"
          className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate max-w-[260px] sm:max-w-none whitespace-nowrap shrink-0"
        >
          รายละเอียดหม้อแปลงขาย เก่าชำรุด กฟส.ฝาง
        </a>

        <nav
          aria-label="เมนูหลัก"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#lots"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            ล็อตสินค้า
          </a>
          <a
            href="#catalog"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            รายการหม้อแปลง
          </a>
          <a
            href="#contact"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            ข้อมูลติดต่อ
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onJumpToLots}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 whitespace-nowrap shrink-0 cursor-pointer"
          >
            ดูรายการแยกตามล็อต
          </button>
        </div>
      </div>
    </header>
  );
}

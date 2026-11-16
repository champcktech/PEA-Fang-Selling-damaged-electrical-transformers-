export const PHOTO_SLOT_LABELS = [
  '1. ภาพรวมหม้อแปลง',
  '2. เลข PEA',
  '3. เนมเพลท',
] as const;

export const KVA_PRESET_OPTIONS = [
  10, 20, 30, 50, 100, 160, 250, 315, 400, 500,
] as const;

export type TransformerPhase = '1 เฟส' | '3 เฟส';

export const PEA_NO_REGEX = /^TR[0-9]{2}-[0-9]{6}$/;

export interface TransformerImage {
  url: string;
  caption: string;
}

export interface TransformerLot {
  id: string;
  shortLabel: string;
  sourceLocation: string;
  startDate: string;
  endDate: string;
  bidOpeningAt: string;
  description: string;
}

export interface TransformerUnit {
  id: string;
  lotId: string;
  lotCode: string;
  peaNo: string;
  kva: number;
  phase: TransformerPhase;
  stockQty: number;
  summaryNote: string;
  images: TransformerImage[];
}

export const HERO_IMAGE = '/assets/aistudio/banner_c88a818b.jpeg';

const IMG_OIL_HIGH = '/images/lot_oil_high_kva_1794794273929.jpg';
const IMG_POLE_DIST = '/images/lot_pole_mounted_1794794274166.jpg';
const IMG_DRY_RESIN = '/images/lot_dry_cast_resin_1794794275077.jpg';
const IMG_PAD_SEALED = '/images/lot_pad_mounted_1794794275090.jpg';
const IMG_DETAIL_BUSHING = '/images/detail_nameplate_bushing_1794794276341.jpg';

export const LOTS: TransformerLot[] = [
  {
    id: 'lot-f1',
    shortLabel: 'ประกาศที่ 1 · ระบบจำหน่าย 22kV',
    sourceLocation: 'ลานพัสดุ กฟส.ฝาง อ.ฝาง จ.เชียงใหม่',
    startDate: '2026-11-16T08:30',
    endDate: '2026-11-24T16:30',
    bidOpeningAt: '2026-11-25T10:00',
    description:
      'หม้อแปลงไฟฟ้าชนิดน้ำมันที่ปลดระวางจากการใช้งานในพื้นที่ อ.ฝาง เนื่องจากขดลวดเสื่อมสภาพ ฟ้าผ่า หรือตัวถังรั่วซึม จัดเรียงแยกตามประกาศพร้อมป้าย PEA No. เพื่อความสะดวกในการตรวจสอบสภาพจริง',
  },
  {
    id: 'lot-f2',
    shortLabel: 'ประกาศที่ 2 · กำลังกลาง–ใหญ่',
    sourceLocation: 'ลานพัสดุ กฟส.ฝาง (โซนหม้อแปลงใหญ่)',
    startDate: '2026-11-18T08:30',
    endDate: '2026-11-27T16:30',
    bidOpeningAt: '2026-11-30T10:30',
    description:
      'หม้อแปลงพิกัดกำลังกลางและใหญ่ที่ถอดเปลี่ยนจากโรงงานและจุดจ่ายไฟหลัก มีร่องรอยชำรุดของขดลวดหรือปะเก็นเสื่อมสภาพ ตัวถังเหล็กและแกนเหล็ก/ทองแดงภายในยังครบชุด ขายตามสภาพจริง',
  },
  {
    id: 'lot-f3',
    shortLabel: 'ประกาศที่ 3 · ชำรุดหนัก / ซากอะไหล่',
    sourceLocation: 'จุดพักพัสดุชำรุด กฟส.ฝาง',
    startDate: '2026-11-20T08:30',
    endDate: '2026-12-02T16:30',
    bidOpeningAt: '2026-12-04T09:30',
    description:
      'หม้อแปลงเก่าชำรุดหนักจากเหตุไฟไหม้ขดลวด ฟ้าผ่า หรือถูกถอดอุปกรณ์บางส่วน เหมาะสำหรับผู้สนใจประมูลซื้อซากโลหะ แกนเหล็กซิลิคอน หรือแยกชิ้นส่วนอะไหล่',
  },
];

export const TRANSFORMER_UNITS: TransformerUnit[] = [
  {
    id: 'tr-f1-1',
    lotId: 'lot-f1',
    lotCode: 'ประกาศที่ 1 · ระบบจำหน่าย 22kV',
    peaNo: 'TR54-025018',
    kva: 250,
    phase: '3 เฟส',
    stockQty: 2,
    summaryNote:
      'ปลดระวางจากระบบจำหน่าย อ.ฝาง ตัวถังภายนอกยังมีสภาพแข็งแรง ครีบระบายความร้อนไม่บิดเบี้ยว น้ำมันภายในยังอยู่ครบ (เสื่อมสภาพ)',
    images: [
      { url: IMG_POLE_DIST, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f1-2',
    lotId: 'lot-f1',
    lotCode: 'ประกาศที่ 1 · ระบบจำหน่าย 22kV',
    peaNo: 'TR52-016044',
    kva: 160,
    phase: '3 เฟส',
    stockQty: 3,
    summaryNote:
      'ถอดเปลี่ยนตามวาระซ่อมบำรุง พบคราบน้ำมันซึมบริเวณตะเข็บถังด้านล่าง ขั้วต่อทองแดงและเนมเพลทเดิมอยู่ครบ เหมาะสำหรับนำไปซ่อมแซมหรือแยกอะไหล่',
    images: [
      { url: IMG_POLE_DIST, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f1-3',
    lotId: 'lot-f1',
    lotCode: 'ประกาศที่ 1 · ระบบจำหน่าย 22kV',
    peaNo: 'TR51-010209',
    kva: 100,
    phase: '3 เฟส',
    stockQty: 2,
    summaryNote:
      'หม้อแปลง 100 kVA ปลดระวางเนื่องจากบุชชิ่งพอร์ซเลนฝั่งแรงสูงบิ่นเสียหาย ขดลวดภายในยังไม่ได้เปิดซ่อม ขายตามสภาพจริง',
    images: [
      { url: IMG_PAD_SEALED, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f2-1',
    lotId: 'lot-f2',
    lotCode: 'ประกาศที่ 2 · กำลังกลาง–ใหญ่',
    peaNo: 'TR55-100012',
    kva: 1000,
    phase: '3 เฟส',
    stockQty: 1,
    summaryNote:
      'หม้อแปลงขนาดใหญ่ 1,000 kVA ถอดออกเนื่องจากค่าน้ำมันตกเกณฑ์ ตัวถังและครีบระบายความร้อนครบชุด',
    images: [
      { url: IMG_OIL_HIGH, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f2-2',
    lotId: 'lot-f2',
    lotCode: 'ประกาศที่ 2 · กำลังกลาง–ใหญ่',
    peaNo: 'TR56-050031',
    kva: 500,
    phase: '3 เฟส',
    stockQty: 2,
    summaryNote:
      'หม้อแปลง 500 kVA มีอาการครีบถังบวมเล็กน้อยจากการใช้งานหนักต่อเนื่องและวัดค่าฉนวนไม่ผ่านเกณฑ์การจ่ายไฟต่อ จำหน่ายตามสภาพ',
    images: [
      { url: IMG_PAD_SEALED, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f2-3',
    lotId: 'lot-f2',
    lotCode: 'ประกาศที่ 2 · กำลังกลาง–ใหญ่',
    peaNo: 'TR57-080007',
    kva: 800,
    phase: '3 เฟส',
    stockQty: 1,
    summaryNote:
      'หม้อแปลง 800 kVA คอยล์มีรอยร้าวและคราบเขม่าบางส่วน แกนเหล็กและขดลวดภายในยังอยู่ครบชุด',
    images: [
      { url: IMG_DRY_RESIN, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f3-1',
    lotId: 'lot-f3',
    lotCode: 'ประกาศที่ 3 · ชำรุดหนัก / ซากอะไหล่',
    peaNo: 'TR48-016091',
    kva: 160,
    phase: '3 เฟส',
    stockQty: 4,
    summaryNote:
      'หม้อแปลงชำรุดหนักจากเหตุฟ้าผ่า ขดลวดภายในไหม้และถ่ายน้ำมันหม้อแปลงออกหมดแล้วเพื่อความปลอดภัยในการจัดเก็บ เหมาะสำหรับประมูลซื้อซากเหล็กและทองแดง',
    images: [
      { url: IMG_POLE_DIST, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
  {
    id: 'tr-f3-2',
    lotId: 'lot-f3',
    lotCode: 'ประกาศที่ 3 · ชำรุดหนัก / ซากอะไหล่',
    peaNo: 'TR47-005155',
    kva: 50,
    phase: '1 เฟส',
    stockQty: 5,
    summaryNote:
      'ซากหม้อแปลง 50 kVA สภาพเก่า ตัวถังมีสนิมผุและบุชชิ่งแรงต่ำชำรุดขาดหาย 2 ต้น แกนเหล็กและขดลวดภายในยังไม่ได้รื้อถอน ขายตามสภาพหน้าลานพัสดุ',
    images: [
      { url: IMG_POLE_DIST, caption: PHOTO_SLOT_LABELS[0] },
      { url: HERO_IMAGE, caption: PHOTO_SLOT_LABELS[1] },
      { url: IMG_DETAIL_BUSHING, caption: PHOTO_SLOT_LABELS[2] },
    ],
  },
];

const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatThaiDateTime(value: string): string {
  if (!value) return '-';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) return value;
  const yearBe = Number(match[1]) + 543;
  const monthIdx = Number(match[2]) - 1;
  const day = Number(match[3]);
  const monthName = THAI_SHORT_MONTHS[monthIdx] || match[2];
  if (match[4] && match[5]) {
    return `${day} ${monthName} ${yearBe} เวลา ${match[4]}:${match[5]} น.`;
  }
  return `${day} ${monthName} ${yearBe}`;
}

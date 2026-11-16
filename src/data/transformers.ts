export type TransformerType =
  | 'Oil-Immersed'
  | 'Dry-Type Cast Resin'
  | 'Hermetically Sealed';

export type TransformerCondition =
  | 'เก่า ชำรุด (ขายตามสภาพ)'
  | 'ชำรุดหนัก / ขายซากอะไหล่';

export interface TransformerImage {
  url: string;
  caption: string;
}

export interface TransformerLot {
  id: string;
  code: string;
  name: string;
  shortLabel: string;
  sourceLocation: string;
  inspectedDate: string;
  kvaRange: string;
  description: string;
}

export interface TransformerUnit {
  id: string;
  lotId: string;
  lotCode: string;
  sku: string;
  peaAssetNo: string;
  title: string;
  brand: string;
  type: TransformerType;
  typeLabelTh: string;
  condition: TransformerCondition;
  damageDetail: string;
  kva: number;
  primaryVoltage: string;
  secondaryVoltage: string;
  vectorGroup: string;
  frequency: string;
  phase: string;
  cooling: string;
  year: number;
  weightKg: number;
  dimensionsMm: string;
  stockQty: number;
  priceThb: number;
  summaryNote: string;
  images: TransformerImage[];
}

export const HERO_IMAGE = '/src/assets/images/hero_transformer_yard_1794794273321.jpg';

const IMG_OIL_HIGH = '/src/assets/images/lot_oil_high_kva_1794794273929.jpg';
const IMG_POLE_DIST = '/src/assets/images/lot_pole_mounted_1794794274166.jpg';
const IMG_DRY_RESIN = '/src/assets/images/lot_dry_cast_resin_1794794275077.jpg';
const IMG_PAD_SEALED = '/src/assets/images/lot_pad_mounted_1794794275090.jpg';
const IMG_DETAIL_BUSHING = '/src/assets/images/detail_nameplate_bushing_1794794276341.jpg';

export const LOTS: TransformerLot[] = [
  {
    id: 'lot-f1',
    code: 'Lot F-2601',
    name: 'ล็อตที่ 1 · หม้อแปลงจำหน่ายระบบ 22kV รอจำหน่ายซาก (คลังพัสดุ กฟส.ฝาง)',
    shortLabel: 'Lot F-2601 · ระบบ 22kV (100–250 kVA)',
    sourceLocation: 'ลานพัสดุ กฟส.ฝาง อ.ฝาง จ.เชียงใหม่',
    inspectedDate: 'สำรวจสภาพ พ.ย. 2026',
    kvaRange: '100 – 250 kVA',
    description:
      'หม้อแปลงไฟฟ้าชนิดน้ำมันที่ปลดระวางจากการใช้งานในพื้นที่ อ.ฝาง เนื่องจากขดลวดเสื่อมสภาพ ฟ้าผ่า หรือตัวถังรั่วซึม จัดเรียงแยกตามล็อตพร้อมป้ายรหัสทรัพย์สินเพื่อความสะดวกในการตรวจสอบสภาพจริง',
  },
  {
    id: 'lot-f2',
    code: 'Lot F-2602',
    name: 'ล็อตที่ 2 · หม้อแปลงกำลังขนาดกลาง–ใหญ่ ชำรุด (315–1,000 kVA)',
    shortLabel: 'Lot F-2602 · กำลังกลาง–ใหญ่ (315–1,000 kVA)',
    sourceLocation: 'ลานพัสดุ กฟส.ฝาง (โซนหม้อแปลงใหญ่)',
    inspectedDate: 'สำรวจสภาพ พ.ย. 2026',
    kvaRange: '315 – 1,000 kVA',
    description:
      'หม้อแปลงพิกัดกำลังกลางและใหญ่ที่ถอดเปลี่ยนจากโรงงานและจุดจ่ายไฟหลัก มีร่องรอยชำรุดของขดลวดหรือปะเก็นเสื่อมสภาพ ตัวถังเหล็กและแกนเหล็ก/ทองแดงภายในยังครบชุด ขายตามสภาพจริง',
  },
  {
    id: 'lot-f3',
    code: 'Lot F-2603',
    name: 'ล็อตที่ 3 · หม้อแปลงชำรุดหนัก / ซากอะไหล่ (50–160 kVA)',
    shortLabel: 'Lot F-2603 · ชำรุดหนัก / ซากอะไหล่',
    sourceLocation: 'จุดพักพัสดุชำรุด กฟส.ฝาง',
    inspectedDate: 'สำรวจสภาพ ต.ค. 2026',
    kvaRange: '50 – 160 kVA',
    description:
      'หม้อแปลงเก่าชำรุดหนักจากเหตุไฟไหม้ขดลวด ฟ้าผ่า หรือถูกถอดอุปกรณ์บางส่วน เหมาะสำหรับผู้สนใจประมูลซื้อซากโลหะ แกนเหล็กซิลิคอน หรือแยกชิ้นส่วนอะไหล่',
  },
];

export const TRANSFORMER_UNITS: TransformerUnit[] = [
  {
    id: 'tr-f1-1',
    lotId: 'lot-f1',
    lotCode: 'Lot F-2601',
    sku: 'FG-2601-01',
    peaAssetNo: 'PEA-54-0250-118',
    title: 'หม้อแปลงเก่า 250 kVA — Ekarat (22kV / 400V) ชำรุด',
    brand: 'Ekarat (เอกรัฐ)',
    type: 'Oil-Immersed',
    typeLabelTh: 'ชนิดน้ำมัน (ONAN)',
    condition: 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: 'ขดลวดแรงสูงช็อต 1 เฟส · ปะเก็นฝาบนซึมน้ำมัน',
    kva: 250,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2014,
    weightKg: 1090,
    dimensionsMm: '1,260 × 890 × 1,420 มม.',
    stockQty: 2,
    priceThb: 48000,
    summaryNote:
      'ปลดระวางจากระบบจำหน่าย อ.ฝาง ขดลวดแรงสูงด้านเฟส B ช็อตลงกราวด์ ตัวถังภายนอกยังมีสภาพแข็งแรง ครีบระบายความร้อนไม่บิดเบี้ยว น้ำมันภายในยังอยู่ครบ (เสื่อมสภาพ)',
    images: [
      { url: IMG_POLE_DIST, caption: 'สภาพตัวถังและครีบระบายความร้อนด้านนอก' },
      { url: IMG_DETAIL_BUSHING, caption: 'สภาพบุชชิ่งแรงสูงและจุดต่อสายด้านบน' },
    ],
  },
  {
    id: 'tr-f1-2',
    lotId: 'lot-f1',
    lotCode: 'Lot F-2601',
    sku: 'FG-2601-02',
    peaAssetNo: 'PEA-52-0160-044',
    title: 'หม้อแปลงเก่า 160 kVA — Thai Maxwell (22kV / 400V) ชำรุด',
    brand: 'Thai Maxwell',
    type: 'Oil-Immersed',
    typeLabelTh: 'ชนิดน้ำมัน (ONAN)',
    condition: 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: 'ตัวถังมุมล่างมีรอยรั่วซึม · น้ำมันพร่องระดับต่ำ',
    kva: 160,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2012,
    weightKg: 820,
    dimensionsMm: '1,150 × 820 × 1,340 มม.',
    stockQty: 3,
    priceThb: 32500,
    summaryNote:
      'ถอดเปลี่ยนตามวาระซ่อมบำรุง พบคราบน้ำมันซึมบริเวณตะเข็บถังด้านล่างและซีลบุชชิ่งแรงต่ำ ขั้วต่อทองแดงและเนมเพลทเดิมอยู่ครบ เหมาะสำหรับนำไปซ่อมแซมหรือแยกอะไหล่',
    images: [
      { url: IMG_POLE_DIST, caption: 'ตัวเครื่อง 160 kVA วางบนพาเลทที่ลานพัสดุ กฟส.ฝาง' },
      { url: IMG_DETAIL_BUSHING, caption: 'ขั้วบุชชิ่งแรงสูงพอร์ซเลนด้านบน' },
    ],
  },
  {
    id: 'tr-f1-3',
    lotId: 'lot-f1',
    lotCode: 'Lot F-2601',
    sku: 'FG-2601-03',
    peaAssetNo: 'PEA-51-0100-209',
    title: 'หม้อแปลงเก่า 100 kVA — Charoenchai (22kV / 400V) ชำรุด',
    brand: 'Charoenchai (เจริญชัย)',
    type: 'Hermetically Sealed',
    typeLabelTh: 'ชนิดปิดผนึกสนิท (Sealed)',
    condition: 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: 'บุชชิ่งแรงสูงบิ่น 1 ต้น · ซีลแรงต่ำเสื่อมสภาพ',
    kva: 100,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2011,
    weightKg: 640,
    dimensionsMm: '1,020 × 760 × 1,210 มม.',
    stockQty: 2,
    priceThb: 24000,
    summaryNote:
      'หม้อแปลงแบบปิดผนึก 100 kVA ปลดระวางเนื่องจากบุชชิ่งพอร์ซเลนฝั่ง HV บิ่นเสียหายจากเหตุกิ่งไม้พาดสาย ขดลวดภายในยังไม่ได้เปิดซ่อม ขายตามสภาพจริง',
    images: [
      { url: IMG_PAD_SEALED, caption: 'สภาพตัวถังแบบปิดผนึก 100 kVA' },
      { url: IMG_DETAIL_BUSHING, caption: 'จุดชำรุดบริเวณบุชชิ่งด้านบน' },
    ],
  },
  {
    id: 'tr-f2-1',
    lotId: 'lot-f2',
    lotCode: 'Lot F-2602',
    sku: 'FG-2602-01',
    peaAssetNo: 'PEA-55-1000-012',
    title: 'หม้อแปลงเก่า 1,000 kVA — Tirathai (22kV / 400V) ชำรุด',
    brand: 'Tirathai (ถิรไทย)',
    type: 'Oil-Immersed',
    typeLabelTh: 'ชนิดน้ำมัน (ONAN)',
    condition: 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: 'น้ำมันเสื่อมค่าความเป็นฉนวนต่ำ · วาล์วระบายแรงดันทำงาน',
    kva: 1000,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2013,
    weightKg: 2880,
    dimensionsMm: '1,820 × 1,190 × 1,850 มม.',
    stockQty: 1,
    priceThb: 145000,
    summaryNote:
      'หม้อแปลงขนาดใหญ่ 1,000 kVA ยี่ห้อถิรไทย ขดลวดทองแดง ถอดออกเนื่องจากเกิด Overpressure ภายในถังและค่าน้ำมันตกเกณฑ์ ตัวถังและครีบระบายความร้อนครบชุด',
    images: [
      { url: IMG_OIL_HIGH, caption: 'มุมหน้าเต็มตัวถัง 1,000 kVA พร้อมถัง Conservator' },
      { url: IMG_DETAIL_BUSHING, caption: 'ชุดบุชชิ่งแรงสูงและวาล์วระบายแรงดันด้านบน' },
      { url: HERO_IMAGE, caption: 'สภาพการจัดเก็บในโซนหม้อแปลงขนาดใหญ่' },
    ],
  },
  {
    id: 'tr-f2-2',
    lotId: 'lot-f2',
    lotCode: 'Lot F-2602',
    sku: 'FG-2602-02',
    peaAssetNo: 'PEA-56-0500-031',
    title: 'หม้อแปลงเก่า 500 kVA — QTC Energy (22kV / 400V) ชำรุด',
    brand: 'QTC Energy',
    type: 'Hermetically Sealed',
    typeLabelTh: 'ชนิดปิดผนึกสนิท (Sealed)',
    condition: 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: 'ครีบระบายความร้อนบวมผิดรูป · ค่าฉนวนต่ำกว่าเกณฑ์',
    kva: 500,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2015,
    weightKg: 1610,
    dimensionsMm: '1,480 × 1,020 × 1,590 มม.',
    stockQty: 2,
    priceThb: 86000,
    summaryNote:
      'หม้อแปลง 500 kVA แบบปิดผนึก มีอาการครีบถังบวมเล็กน้อยจากการใช้งานหนักต่อเนื่องและวัดค่าฉนวนไม่ผ่านเกณฑ์การจ่ายไฟต่อ จำหน่ายตามสภาพ',
    images: [
      { url: IMG_PAD_SEALED, caption: 'ตัวถังแบบปิดผนึก 500 kVA ด้านหน้าพร้อมเนมเพลท' },
      { url: IMG_DETAIL_BUSHING, caption: 'รายละเอียดเกจวัดระดับน้ำมันและบุชชิ่งด้านบน' },
    ],
  },
  {
    id: 'tr-f2-3',
    lotId: 'lot-f2',
    lotCode: 'Lot F-2602',
    sku: 'FG-2602-03',
    peaAssetNo: 'PEA-57-0800-007',
    title: 'หม้อแปลงแห้งเก่า 800 kVA — ABB Cast Resin (22kV / 400V) ชำรุด',
    brand: 'ABB',
    type: 'Dry-Type Cast Resin',
    typeLabelTh: 'ชนิดแห้ง Cast Resin',
    condition: 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: 'คอยล์เรซินเฟส C มีรอยร้าวและคราบเขม่าอาร์ค',
    kva: 800,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'AN',
    year: 2016,
    weightKg: 2150,
    dimensionsMm: '1,580 × 980 × 1,780 มม.',
    stockQty: 1,
    priceThb: 112000,
    summaryNote:
      'หม้อแปลงชนิดแห้ง ABB 800 kVA เกิดรอยร้าวและคราบเขม่าบนผิวอีพ็อกซี่เรซินเฟส C ส่วนคอยล์เฟส A, B และแกนเหล็กพร้อมบัสบาร์ทองแดงยังอยู่ครบชุด',
    images: [
      { url: IMG_DRY_RESIN, caption: 'สภาพคอยล์ Cast Resin 3 เฟสและโครงเหล็กยึด' },
      { url: IMG_DETAIL_BUSHING, caption: 'จุดเชื่อมต่อขั้วแรงสูงและฉนวนรองรับ' },
    ],
  },
  {
    id: 'tr-f3-1',
    lotId: 'lot-f3',
    lotCode: 'Lot F-2603',
    sku: 'FG-2603-01',
    peaAssetNo: 'PEA-48-0160-091',
    title: 'ซากหม้อแปลง 160 kVA — Ekarat (ชำรุดหนัก / ขายตามสภาพ)',
    brand: 'Ekarat (เอกรัฐ)',
    type: 'Oil-Immersed',
    typeLabelTh: 'ชนิดน้ำมัน (ONAN)',
    condition: 'ชำรุดหนัก / ขายซากอะไหล่',
    damageDetail: 'ขดลวดไหม้จากฟ้าผ่า · ถ่ายน้ำมันออกแล้ว (ไม่มีน้ำมัน)',
    kva: 160,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2008,
    weightKg: 760,
    dimensionsMm: '1,150 × 820 × 1,340 มม.',
    stockQty: 4,
    priceThb: 21000,
    summaryNote:
      'หม้อแปลงชำรุดหนักจากเหตุฟ้าผ่า ขดลวดภายในไหม้และถ่ายน้ำมันหม้อแปลงออกหมดแล้วเพื่อความปลอดภัยในการจัดเก็บ เหมาะสำหรับประมูลซื้อซากเหล็กและทองแดง',
    images: [
      { url: IMG_POLE_DIST, caption: 'สภาพซากหม้อแปลง 160 kVA (ถ่ายน้ำมันออกแล้ว)' },
      { url: IMG_DETAIL_BUSHING, caption: 'สภาพฝาถังและบุชชิ่งด้านบน' },
    ],
  },
  {
    id: 'tr-f3-2',
    lotId: 'lot-f3',
    lotCode: 'Lot F-2603',
    sku: 'FG-2603-02',
    peaAssetNo: 'PEA-47-0050-155',
    title: 'ซากหม้อแปลง 50 kVA — Precimeasure (ชำรุดหนัก / ขายตามสภาพ)',
    brand: 'Precimeasure',
    type: 'Oil-Immersed',
    typeLabelTh: 'ชนิดน้ำมัน (ONAN)',
    condition: 'ชำรุดหนัก / ขายซากอะไหล่',
    damageDetail: 'ตัวถังผุเป็นสนิม · ขาดบุชชิ่งแรงต่ำ 2 ต้น',
    kva: 50,
    primaryVoltage: '22,000 V',
    secondaryVoltage: '400 / 230 V',
    vectorGroup: 'Dyn11',
    frequency: '50 Hz',
    phase: '3 เฟส',
    cooling: 'ONAN',
    year: 2007,
    weightKg: 420,
    dimensionsMm: '920 × 680 × 1,080 มม.',
    stockQty: 5,
    priceThb: 11500,
    summaryNote:
      'ซากหม้อแปลง 50 kVA สภาพเก่า ตัวถังมีสนิมผุและบุชชิ่งแรงต่ำชำรุดขาดหาย 2 ต้น แกนเหล็กและขดลวดภายในยังไม่ได้รื้อถอน ขายตามสภาพหน้าลานพัสดุ',
    images: [
      { url: IMG_POLE_DIST, caption: 'ตัวถังขนาด 50 kVA ที่จุดพักพัสดุชำรุด' },
      { url: IMG_DETAIL_BUSHING, caption: 'มุมฝาบนและขั้วต่อที่เหลืออยู่' },
    ],
  },
];

export function formatThb(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

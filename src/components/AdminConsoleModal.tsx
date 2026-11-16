import { FormEvent, useEffect, useState } from 'react';
import { Database, LogIn, LogOut, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  TransformerCondition,
  TransformerLot,
  TransformerType,
  TransformerUnit,
  formatThb,
} from '../data/transformers';
import {
  clearAllCatalogInFirestore,
  deleteLotFromFirestore,
  deleteTransformerFromFirestore,
  saveLotToFirestore,
  saveTransformerToFirestore,
  seedInitialCatalogToFirestore,
} from '../lib/firebase';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'lots' | 'transformers';

const IMAGE_PRESETS = [
  {
    label: 'หม้อแปลงระบบจำหน่าย 22kV (50–250 kVA)',
    url: '/src/assets/images/lot_pole_mounted_1794794274166.jpg',
  },
  {
    label: 'หม้อแปลงน้ำมันขนาดใหญ่ (500–1,000 kVA)',
    url: '/src/assets/images/lot_oil_high_kva_1794794273929.jpg',
  },
  {
    label: 'หม้อแปลงแบบปิดผนึกสนิท (Sealed Type)',
    url: '/src/assets/images/lot_pad_mounted_1794794275090.jpg',
  },
  {
    label: 'หม้อแปลงชนิดแห้ง Cast Resin',
    url: '/src/assets/images/lot_dry_cast_resin_1794794275077.jpg',
  },
];

const DETAIL_IMAGE = '/src/assets/images/detail_nameplate_bushing_1794794276341.jpg';

export function AdminConsoleModal({ isOpen, onClose }: AdminConsoleModalProps) {
  const {
    user,
    isAdmin,
    signInWithGoogle,
    signOutUser,
    lots,
    units,
    isUsingFirestoreData,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<AdminTab>('transformers');
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lot Form State
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [lotCode, setLotCode] = useState('');
  const [lotName, setLotName] = useState('');
  const [lotShortLabel, setLotShortLabel] = useState('');
  const [lotLocation, setLotLocation] = useState('ลานพัสดุ กฟส.ฝาง อ.ฝาง จ.เชียงใหม่');
  const [lotInspectedDate, setLotInspectedDate] = useState('สำรวจสภาพ พ.ย. 2026');
  const [lotKvaRange, setLotKvaRange] = useState('');
  const [lotDescription, setLotDescription] = useState('');

  // Transformer Form State
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitLotId, setUnitLotId] = useState('');
  const [unitSku, setUnitSku] = useState('');
  const [unitPeaAssetNo, setUnitPeaAssetNo] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [unitBrand, setUnitBrand] = useState('');
  const [unitType, setUnitType] = useState<TransformerType>('Oil-Immersed');
  const [unitCondition, setUnitCondition] = useState<TransformerCondition>(
    'เก่า ชำรุด (ขายตามสภาพ)'
  );
  const [unitDamageDetail, setUnitDamageDetail] = useState('');
  const [unitKva, setUnitKva] = useState('160');
  const [unitPrimaryV, setUnitPrimaryV] = useState('22,000 V');
  const [unitSecondaryV, setUnitSecondaryV] = useState('400 / 230 V');
  const [unitVectorGroup, setUnitVectorGroup] = useState('Dyn11');
  const [unitCooling, setUnitCooling] = useState('ONAN');
  const [unitYear, setUnitYear] = useState('2014');
  const [unitWeightKg, setUnitWeightKg] = useState('820');
  const [unitDimensions, setUnitDimensions] = useState('1,150 × 820 × 1,340 มม.');
  const [unitStockQty, setUnitStockQty] = useState('1');
  const [unitPriceThb, setUnitPriceThb] = useState('32000');
  const [unitSummary, setUnitSummary] = useState('');
  const [unitImageUrl, setUnitImageUrl] = useState(IMAGE_PRESETS[0].url);

  useEffect(() => {
    if (!unitLotId && lots.length > 0) {
      setUnitLotId(lots[0].id);
    }
  }, [lots, unitLotId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetLotForm = () => {
    setEditingLotId(null);
    setLotCode('');
    setLotName('');
    setLotShortLabel('');
    setLotLocation('ลานพัสดุ กฟส.ฝาง อ.ฝาง จ.เชียงใหม่');
    setLotInspectedDate('สำรวจสภาพ พ.ย. 2026');
    setLotKvaRange('');
    setLotDescription('');
  };

  const startEditLot = (lot: TransformerLot) => {
    setEditingLotId(lot.id);
    setLotCode(lot.code);
    setLotName(lot.name);
    setLotShortLabel(lot.shortLabel);
    setLotLocation(lot.sourceLocation);
    setLotInspectedDate(lot.inspectedDate);
    setLotKvaRange(lot.kvaRange);
    setLotDescription(lot.description);
  };

  const resetUnitForm = () => {
    setEditingUnitId(null);
    setUnitLotId(lots[0]?.id || '');
    setUnitSku('');
    setUnitPeaAssetNo('');
    setUnitTitle('');
    setUnitBrand('');
    setUnitType('Oil-Immersed');
    setUnitCondition('เก่า ชำรุด (ขายตามสภาพ)');
    setUnitDamageDetail('');
    setUnitKva('160');
    setUnitPrimaryV('22,000 V');
    setUnitSecondaryV('400 / 230 V');
    setUnitVectorGroup('Dyn11');
    setUnitCooling('ONAN');
    setUnitYear('2014');
    setUnitWeightKg('820');
    setUnitDimensions('1,150 × 820 × 1,340 มม.');
    setUnitStockQty('1');
    setUnitPriceThb('32000');
    setUnitSummary('');
    setUnitImageUrl(IMAGE_PRESETS[0].url);
  };

  const startEditUnit = (unit: TransformerUnit) => {
    setEditingUnitId(unit.id);
    setUnitLotId(unit.lotId);
    setUnitSku(unit.sku);
    setUnitPeaAssetNo(unit.peaAssetNo);
    setUnitTitle(unit.title);
    setUnitBrand(unit.brand);
    setUnitType(unit.type);
    setUnitCondition(unit.condition);
    setUnitDamageDetail(unit.damageDetail);
    setUnitKva(String(unit.kva));
    setUnitPrimaryV(unit.primaryVoltage);
    setUnitSecondaryV(unit.secondaryVoltage);
    setUnitVectorGroup(unit.vectorGroup);
    setUnitCooling(unit.cooling);
    setUnitYear(String(unit.year));
    setUnitWeightKg(String(unit.weightKg));
    setUnitDimensions(unit.dimensionsMm);
    setUnitStockQty(String(unit.stockQty));
    setUnitPriceThb(String(unit.priceThb));
    setUnitSummary(unit.summaryNote);
    setUnitImageUrl(unit.images[0]?.url || IMAGE_PRESETS[0].url);
  };

  const handleSeedDatabase = async () => {
    setErrorMsg(null);
    setBusyMessage('กำลังนำเข้าข้อมูลหม้อแปลงเก่าชำรุด กฟส.ฝาง ลง Firebase Firestore...');
    try {
      await seedInitialCatalogToFirestore();
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleClearAllCatalog = async () => {
    setErrorMsg(null);
    setBusyMessage('กำลังลบข้อมูลหม้อแปลงและล็อตทั้งหมดออกจาก Firestore...');
    try {
      if (!isUsingFirestoreData) {
        await clearAllCatalogInFirestore([], []);
      } else {
        await clearAllCatalogInFirestore(
          lots.map((l) => l.id),
          units.map((u) => u.id)
        );
      }
      resetLotForm();
      resetUnitForm();
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'ล้างข้อมูลไม่สำเร็จ');
    }
  };

  const handleDeleteLot = async (lot: TransformerLot) => {
    setErrorMsg(null);
    setBusyMessage(`กำลังลบล็อต ${lot.code} และหม้อแปลงในล็อต...`);
    try {
      if (!isUsingFirestoreData) {
        await seedInitialCatalogToFirestore({ excludeLotId: lot.id });
      } else {
        const unitIdsInLot = units
          .filter((u) => u.lotId === lot.id)
          .map((u) => u.id);
        await deleteLotFromFirestore(lot.id, unitIdsInLot);
      }
      if (editingLotId === lot.id) resetLotForm();
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'ลบล็อตไม่สำเร็จ');
    }
  };

  const handleDeleteUnit = async (unit: TransformerUnit) => {
    setErrorMsg(null);
    setBusyMessage(`กำลังลบ ${unit.title} ออกจาก Firestore...`);
    try {
      if (!isUsingFirestoreData) {
        await seedInitialCatalogToFirestore({ excludeUnitId: unit.id });
      } else {
        await deleteTransformerFromFirestore(unit.id);
      }
      if (editingUnitId === unit.id) resetUnitForm();
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'ลบข้อมูลหม้อแปลงไม่สำเร็จ');
    }
  };

  const handleSaveLot = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBusyMessage('กำลังบันทึกล็อตสินค้าลง Firestore...');
    try {
      if (!isUsingFirestoreData && editingLotId) {
        await seedInitialCatalogToFirestore();
      }
      await saveLotToFirestore(
        {
          id: editingLotId || undefined,
          code: lotCode,
          name: lotName,
          shortLabel: lotShortLabel || lotCode,
          sourceLocation: lotLocation,
          inspectedDate: lotInspectedDate,
          kvaRange: lotKvaRange,
          description: lotDescription,
        },
        !editingLotId
      );
      resetLotForm();
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'บันทึกล็อตไม่สำเร็จ');
    }
  };

  const handleSaveUnit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isUsingFirestoreData) {
      setErrorMsg(
        'กรุณากด "นำเข้าข้อมูลตั้งต้น กฟส.ฝาง ลง Firestore" หรือเพิ่มล็อตใน Firestore ก่อนเพิ่มหม้อแปลง'
      );
      return;
    }
    const targetLot = lots.find((l) => l.id === unitLotId);
    if (!targetLot) {
      setErrorMsg('ไม่พบล็อตที่เลือก กรุณาสร้างล็อตสินค้าก่อน');
      return;
    }
    setErrorMsg(null);
    setBusyMessage('กำลังบันทึกข้อมูลหม้อแปลงลง Firestore...');
    const typeLabelMap: Record<TransformerType, string> = {
      'Oil-Immersed': 'ชนิดน้ำมัน (ONAN)',
      'Dry-Type Cast Resin': 'ชนิดแห้ง Cast Resin',
      'Hermetically Sealed': 'ชนิดปิดผนึกสนิท (Sealed)',
    };
    try {
      await saveTransformerToFirestore(
        {
          id: editingUnitId || undefined,
          lotId: targetLot.id,
          lotCode: targetLot.code,
          sku: unitSku,
          peaAssetNo: unitPeaAssetNo,
          title: unitTitle,
          brand: unitBrand,
          type: unitType,
          typeLabelTh: typeLabelMap[unitType],
          condition: unitCondition,
          damageDetail: unitDamageDetail,
          kva: Number(unitKva),
          primaryVoltage: unitPrimaryV,
          secondaryVoltage: unitSecondaryV,
          vectorGroup: unitVectorGroup,
          frequency: '50 Hz',
          phase: '3 เฟส',
          cooling: unitCooling,
          year: Number(unitYear),
          weightKg: Number(unitWeightKg),
          dimensionsMm: unitDimensions,
          stockQty: Number(unitStockQty),
          priceThb: Number(unitPriceThb),
          summaryNote: unitSummary,
          imageUrls: [unitImageUrl, DETAIL_IMAGE],
          imageCaptions: [unitTitle, 'รายละเอียดบุชชิ่งและจุดเชื่อมต่อ'],
        },
        !editingUnitId
      );
      resetUnitForm();
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'บันทึกหม้อแปลงไม่สำเร็จ');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div>
            <h2 id="admin-modal-title" className="font-display text-lg font-bold">
              จัดการฐานข้อมูลหม้อแปลง กฟส.ฝาง (Firebase Firestore)
            </h2>
            <p className="text-xs text-slate-300">
              สำหรับเจ้าหน้าที่ในการเพิ่ม/แก้ไข/ลบข้อมูลล็อตและรายการหม้อแปลงเก่าชำรุด
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={() => signOutUser()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>ออกจากระบบ</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {!user ? (
          <div className="p-10 text-center space-y-4">
            <p className="text-base font-semibold text-slate-900">
              กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อจัดการฐานข้อมูล
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              บุคคลทั่วไปสามารถเข้าชมข้อมูลหม้อแปลงได้โดยไม่ต้องเข้าสู่ระบบ
              ส่วนหน้าต่างนี้สงวนสิทธิ์สำหรับเจ้าหน้าที่แก้ไขข้อมูลใน Firestore เท่านั้น
            </p>
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-base font-semibold text-red-700">
              บัญชี {user.email} ไม่มีสิทธิ์แก้ไขข้อมูลผู้ดูแล
            </p>
            <p className="text-sm text-slate-600">
              กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลที่ได้รับอนุญาต
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {(
                  [
                    { id: 'transformers', label: `รายการหม้อแปลง (${units.length})` },
                    { id: 'lots', label: `ล็อตสินค้า (${lots.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-amber-600 text-slate-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={Boolean(busyMessage)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {isUsingFirestoreData
                      ? 'รีเซ็ตข้อมูลตั้งต้น กฟส.ฝาง'
                      : 'นำเข้าข้อมูลตั้งต้น กฟส.ฝาง'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllCatalog}
                  disabled={Boolean(busyMessage) || (lots.length === 0 && units.length === 0)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>ลบข้อมูลทั้งหมด (เริ่มคลังว่าง)</span>
                </button>
              </div>
            </div>

            {(busyMessage || errorMsg) && (
              <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
                {busyMessage && <p className="text-amber-800 font-medium">{busyMessage}</p>}
                {errorMsg && <p className="text-red-700 font-medium break-all">{errorMsg}</p>}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'lots' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5">
                    <form
                      onSubmit={handleSaveLot}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">
                          {editingLotId ? 'แก้ไขข้อมูลล็อต' : 'เพิ่มล็อตใหม่ลง Firestore'}
                        </h3>
                        {editingLotId && (
                          <button
                            type="button"
                            onClick={resetLotForm}
                            className="text-xs text-slate-600 underline cursor-pointer"
                          >
                            ยกเลิกแก้ไข
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            รหัสล็อต *
                          </label>
                          <input
                            type="text"
                            required
                            value={lotCode}
                            onChange={(e) => setLotCode(e.target.value)}
                            placeholder="เช่น Lot F-2604"
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            ช่วงพิกัด kVA *
                          </label>
                          <input
                            type="text"
                            required
                            value={lotKvaRange}
                            onChange={(e) => setLotKvaRange(e.target.value)}
                            placeholder="เช่น 50 – 250 kVA"
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          ชื่อล็อตเต็ม *
                        </label>
                        <input
                          type="text"
                          required
                          value={lotName}
                          onChange={(e) => setLotName(e.target.value)}
                          placeholder="เช่น ล็อตที่ 4 · หม้อแปลงเก่าชำรุด อ.ฝาง"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          ชื่อย่อบนแท็บ *
                        </label>
                        <input
                          type="text"
                          required
                          value={lotShortLabel}
                          onChange={(e) => setLotShortLabel(e.target.value)}
                          placeholder="เช่น Lot F-2604 · อ.ฝาง"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            จุดจัดเก็บ *
                          </label>
                          <input
                            type="text"
                            required
                            value={lotLocation}
                            onChange={(e) => setLotLocation(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            วันที่สำรวจ *
                          </label>
                          <input
                            type="text"
                            required
                            value={lotInspectedDate}
                            onChange={(e) => setLotInspectedDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          คำอธิบายล็อต *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={lotDescription}
                          onChange={(e) => setLotDescription(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={Boolean(busyMessage)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>{editingLotId ? 'บันทึกการแก้ไขล็อต' : 'เพิ่มล็อตลง Firestore'}</span>
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      รายการล็อตทั้งหมด ({lots.length} ล็อต)
                    </h3>
                    {lots.length === 0 ? (
                      <div className="p-8 text-center border border-slate-200 rounded-xl text-sm text-slate-500">
                        ยังไม่มีล็อตสินค้าในฐานข้อมูล สามารถสร้างล็อตใหม่ได้ทางซ้าย
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {lots.map((lot) => (
                          <div
                            key={lot.id}
                            className="p-4 flex items-start justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-mono text-amber-700 font-semibold">
                                {lot.code} · {lot.kvaRange}
                              </p>
                              <p className="text-sm font-semibold text-slate-900">{lot.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {lot.sourceLocation} · {lot.inspectedDate}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditLot(lot)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`แก้ไข ${lot.code}`}
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLot(lot)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`ลบ ${lot.code}`}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'transformers' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5">
                    <form
                      onSubmit={handleSaveUnit}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">
                          {editingUnitId ? 'แก้ไขหม้อแปลง' : 'เพิ่มหม้อแปลงใหม่ลง Firestore'}
                        </h3>
                        {editingUnitId && (
                          <button
                            type="button"
                            onClick={resetUnitForm}
                            className="text-xs text-slate-600 underline cursor-pointer"
                          >
                            ยกเลิกแก้ไข
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            สังกัดล็อต *
                          </label>
                          <select
                            value={unitLotId}
                            onChange={(e) => setUnitLotId(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          >
                            {lots.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            รหัสทรัพย์สิน กฟภ. *
                          </label>
                          <input
                            type="text"
                            required
                            value={unitPeaAssetNo}
                            onChange={(e) => setUnitPeaAssetNo(e.target.value)}
                            placeholder="PEA-54-0160-012"
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            รหัสรายการ (SKU) *
                          </label>
                          <input
                            type="text"
                            required
                            value={unitSku}
                            onChange={(e) => setUnitSku(e.target.value)}
                            placeholder="FG-2601-04"
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            ยี่ห้อ *
                          </label>
                          <input
                            type="text"
                            required
                            value={unitBrand}
                            onChange={(e) => setUnitBrand(e.target.value)}
                            placeholder="Ekarat / Tirathai"
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          ชื่อรายการหม้อแปลง *
                        </label>
                        <input
                          type="text"
                          required
                          value={unitTitle}
                          onChange={(e) => setUnitTitle(e.target.value)}
                          placeholder="หม้อแปลงเก่า 160 kVA — Ekarat ชำรุด"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            ระดับสภาพ *
                          </label>
                          <select
                            value={unitCondition}
                            onChange={(e) =>
                              setUnitCondition(e.target.value as TransformerCondition)
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="เก่า ชำรุด (ขายตามสภาพ)">
                              เก่า ชำรุด (ขายตามสภาพ)
                            </option>
                            <option value="ชำรุดหนัก / ขายซากอะไหล่">
                              ชำรุดหนัก / ขายซากอะไหล่
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            ชนิดหม้อแปลง *
                          </label>
                          <select
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value as TransformerType)}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="Oil-Immersed">ชนิดน้ำมัน (ONAN)</option>
                            <option value="Hermetically Sealed">ชนิดปิดผนึกสนิท</option>
                            <option value="Dry-Type Cast Resin">ชนิดแห้ง Cast Resin</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          อาการชำรุดที่พบ *
                        </label>
                        <input
                          type="text"
                          required
                          value={unitDamageDetail}
                          onChange={(e) => setUnitDamageDetail(e.target.value)}
                          placeholder="เช่น ขดลวดไหม้ 1 เฟส · ตัวถังซึมน้ำมัน"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            พิกัด (kVA) *
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={unitKva}
                            onChange={(e) => setUnitKva(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            จำนวน (เครื่อง) *
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={unitStockQty}
                            onChange={(e) => setUnitStockQty(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            ราคาตั้งขาย (บาท) *
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={unitPriceThb}
                            onChange={(e) => setUnitPriceThb(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            ปีผลิต *
                          </label>
                          <input
                            type="number"
                            required
                            value={unitYear}
                            onChange={(e) => setUnitYear(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            น้ำหนัก (กก.) *
                          </label>
                          <input
                            type="number"
                            required
                            value={unitWeightKg}
                            onChange={(e) => setUnitWeightKg(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          รูปภาพประกอบ
                        </label>
                        <select
                          value={unitImageUrl}
                          onChange={(e) => setUnitImageUrl(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        >
                          {IMAGE_PRESETS.map((p) => (
                            <option key={p.url} value={p.url}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          รายละเอียดเพิ่มเติม *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={unitSummary}
                          onChange={(e) => setUnitSummary(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={Boolean(busyMessage) || lots.length === 0}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {editingUnitId ? 'บันทึกการแก้ไขหม้อแปลง' : 'เพิ่มหม้อแปลงลง Firestore'}
                        </span>
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      รายการหม้อแปลงทั้งหมด ({units.length} รุ่น)
                    </h3>
                    {units.length === 0 ? (
                      <div className="p-8 text-center border border-slate-200 rounded-xl text-sm text-slate-500">
                        ยังไม่มีรายการหม้อแปลงในฐานข้อมูล สามารถเพิ่มรายการใหม่ได้ทางซ้าย
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {units.map((unit) => (
                          <div
                            key={unit.id}
                            className="p-4 flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-mono text-slate-500">
                                {unit.lotCode} · {unit.peaAssetNo} · จำนวน {unit.stockQty} เครื่อง
                              </p>
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {unit.title}
                              </p>
                              <p className="text-xs text-amber-800 truncate">{unit.damageDetail}</p>
                              <p className="text-xs font-mono font-semibold text-slate-800 tabular-nums mt-0.5">
                                {formatThb(unit.priceThb)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditUnit(unit)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`แก้ไข ${unit.sku}`}
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(unit)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`ลบ ${unit.sku}`}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

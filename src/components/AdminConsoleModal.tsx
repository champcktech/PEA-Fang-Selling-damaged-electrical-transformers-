import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Database, LogIn, LogOut, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  HERO_IMAGE,
  KVA_PRESET_OPTIONS,
  PEA_NO_REGEX,
  PHOTO_SLOT_LABELS,
  TransformerLot,
  TransformerPhase,
  TransformerUnit,
  formatThaiDateTime,
} from '../data/transformers';
import {
  clearAllCatalogInFirestore,
  deleteLotFromFirestore,
  deleteTransformerFromFirestore,
  saveLotToFirestore,
  saveTransformerToFirestore,
  seedInitialCatalogToFirestore,
} from '../lib/firebase';
import { ResilientImage } from './ResilientImage';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'lots' | 'transformers';

const IMAGE_PRESETS = [
  {
    label: 'ตัวอย่าง: หม้อแปลงระบบจำหน่าย 22kV',
    url: '/images/lot_pole_mounted_1794794274166.jpg',
  },
  {
    label: 'ตัวอย่าง: หม้อแปลงน้ำมันขนาดใหญ่',
    url: '/images/lot_oil_high_kva_1794794273929.jpg',
  },
  {
    label: 'ตัวอย่าง: หม้อแปลงแบบปิดผนึกสนิท',
    url: '/images/lot_pad_mounted_1794794275090.jpg',
  },
  {
    label: 'ตัวอย่าง: หม้อแปลงชนิดแห้ง Cast Resin',
    url: '/images/lot_dry_cast_resin_1794794275077.jpg',
  },
  {
    label: 'ตัวอย่าง: ลานพัสดุ / ป้ายรหัส PEA',
    url: HERO_IMAGE,
  },
  {
    label: 'ตัวอย่าง: เนมเพลท / บุชชิ่ง',
    url: '/images/detail_nameplate_bushing_1794794276341.jpg',
  },
];

const DEFAULT_PHOTO_TUPLE: [string, string, string] = [
  IMAGE_PRESETS[0].url,
  IMAGE_PRESETS[4].url,
  IMAGE_PRESETS[5].url,
];

async function compressImageFileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
      image.src = objectUrl;
    });

    const attempts: Array<{ maxWidth: number; quality: number }> = [
      { maxWidth: 800, quality: 0.72 },
      { maxWidth: 680, quality: 0.6 },
      { maxWidth: 520, quality: 0.5 },
      { maxWidth: 420, quality: 0.42 },
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('เบราว์เซอร์ไม่รองรับการประมวลผลรูปภาพ');
    }

    for (const attempt of attempts) {
      const scale = Math.min(1, attempt.maxWidth / Math.max(1, img.width));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', attempt.quality);
      if (dataUrl.length <= 270000) {
        return dataUrl;
      }
    }

    throw new Error('ขนาดรูปภาพใหญ่เกินขีดจำกัด กรุณาเลือกรูปที่เล็กลง');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function AdminConsoleModal({ isOpen, onClose }: AdminConsoleModalProps) {
  const {
    user,
    isAdmin,
    authErrorCode,
    signInWithGoogle,
    signOutUser,
    clearAuthError,
    lots,
    units,
    isUsingFirestoreData,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<AdminTab>('transformers');
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Lot Form State
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [lotShortLabel, setLotShortLabel] = useState('');
  const [lotLocation, setLotLocation] = useState('ลานพัสดุ กฟส.ฝาง อ.ฝาง จ.เชียงใหม่');
  const [lotStartDate, setLotStartDate] = useState('2026-11-16T08:30');
  const [lotEndDate, setLotEndDate] = useState('2026-11-24T16:30');
  const [lotBidOpeningAt, setLotBidOpeningAt] = useState('2026-11-25T10:00');
  const [lotDescription, setLotDescription] = useState('');

  // Transformer Form State
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitLotId, setUnitLotId] = useState('');
  const [unitPeaNo, setUnitPeaNo] = useState('');
  const [unitKva, setUnitKva] = useState('160');
  const [isCustomKva, setIsCustomKva] = useState(false);
  const [unitPhase, setUnitPhase] = useState<TransformerPhase>('3 เฟส');
  const [unitStockQty, setUnitStockQty] = useState('1');
  const [unitSummary, setUnitSummary] = useState('');
  const [unitImages, setUnitImages] = useState<[string, string, string]>([
    ...DEFAULT_PHOTO_TUPLE,
  ]);

  useEffect(() => {
    if (lots.length === 0) {
      if (unitLotId !== '') setUnitLotId('');
      return;
    }
    if (!lots.some((l) => l.id === unitLotId)) {
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
    setLotShortLabel('');
    setLotLocation('ลานพัสดุ กฟส.ฝาง อ.ฝาง จ.เชียงใหม่');
    setLotStartDate('2026-11-16T08:30');
    setLotEndDate('2026-11-24T16:30');
    setLotBidOpeningAt('2026-11-25T10:00');
    setLotDescription('');
  };

  const startEditLot = (lot: TransformerLot) => {
    setEditingLotId(lot.id);
    setLotShortLabel(lot.shortLabel);
    setLotLocation(lot.sourceLocation);
    setLotStartDate(lot.startDate || '2026-11-16T08:30');
    setLotEndDate(lot.endDate || '2026-11-24T16:30');
    setLotBidOpeningAt(lot.bidOpeningAt || '2026-11-25T10:00');
    setLotDescription(lot.description);
  };

  const resetUnitForm = () => {
    setEditingUnitId(null);
    setUnitLotId(lots[0]?.id || '');
    setUnitPeaNo('');
    setUnitKva('160');
    setIsCustomKva(false);
    setUnitPhase('3 เฟส');
    setUnitStockQty('1');
    setUnitSummary('');
    setUnitImages([...DEFAULT_PHOTO_TUPLE]);
  };

  const startEditUnit = (unit: TransformerUnit) => {
    const isPreset = KVA_PRESET_OPTIONS.some((preset) => preset === unit.kva);
    setEditingUnitId(unit.id);
    setUnitLotId(unit.lotId);
    setUnitPeaNo(unit.peaNo);
    setUnitKva(String(unit.kva));
    setIsCustomKva(!isPreset);
    setUnitPhase(unit.phase);
    setUnitStockQty(String(unit.stockQty));
    setUnitSummary(unit.summaryNote);
    setUnitImages([
      unit.images[0]?.url || DEFAULT_PHOTO_TUPLE[0],
      unit.images[1]?.url || DEFAULT_PHOTO_TUPLE[1],
      unit.images[2]?.url || DEFAULT_PHOTO_TUPLE[2],
    ]);
  };

  const handlePhotoFileChange = async (
    slotIndex: 0 | 1 | 2,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMsg(null);
    setBusyMessage(`กำลังปรับขนาดรูปภาพ ${PHOTO_SLOT_LABELS[slotIndex]}...`);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setUnitImages((prev) => {
        const next: [string, string, string] = [prev[0], prev[1], prev[2]];
        next[slotIndex] = dataUrl;
        return next;
      });
      setBusyMessage(null);
    } catch (err) {
      setBusyMessage(null);
      setErrorMsg(err instanceof Error ? err.message : 'อัปโหลดรูปภาพไม่สำเร็จ');
    }
  };

  const handlePhotoPresetChange = (slotIndex: 0 | 1 | 2, url: string) => {
    setUnitImages((prev) => {
      const next: [string, string, string] = [prev[0], prev[1], prev[2]];
      next[slotIndex] = url;
      return next;
    });
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
    setBusyMessage(`กำลังลบ ${lot.shortLabel} และหม้อแปลงในล็อต...`);
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
    setBusyMessage(`กำลังลบ ${unit.peaNo} ออกจาก Firestore...`);
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
          shortLabel: lotShortLabel,
          sourceLocation: lotLocation,
          startDate: lotStartDate,
          endDate: lotEndDate,
          bidOpeningAt: lotBidOpeningAt,
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
    const normalizedPeaNo = unitPeaNo.trim().toUpperCase();
    if (!PEA_NO_REGEX.test(normalizedPeaNo)) {
      setErrorMsg('กรุณาระบุ PEA No. ในรูปแบบ TRxx-xxxxxx (เช่น TR54-025018)');
      return;
    }

    if (!isUsingFirestoreData) {
      setErrorMsg(
        'กรุณากด "นำเข้าข้อมูลตั้งต้น กฟส.ฝาง" หรือเพิ่มล็อตใน Firestore ก่อนเพิ่มหม้อแปลง'
      );
      return;
    }
    const targetLot = lots.find((l) => l.id === unitLotId) || lots[0];
    if (!targetLot) {
      setErrorMsg('ไม่พบล็อตที่เลือก กรุณาสร้างล็อตสินค้าก่อน');
      return;
    }

    setErrorMsg(null);
    setBusyMessage('กำลังบันทึกข้อมูลหม้อแปลงลง Firestore...');
    try {
      const parsedKva = Number(unitKva);
      if (!Number.isFinite(parsedKva) || parsedKva < 1 || parsedKva > 100000) {
        setBusyMessage(null);
        setErrorMsg('กรุณาระบุพิกัด (kVA) ตั้งแต่ 1 ถึง 100,000');
        return;
      }
      await saveTransformerToFirestore(
        {
          id: editingUnitId || undefined,
          lotId: targetLot.id,
          lotCode: targetLot.shortLabel.slice(0, 80),
          peaNo: normalizedPeaNo,
          kva: parsedKva,
          phase: unitPhase,
          stockQty: Number(unitStockQty),
          summaryNote: unitSummary,
          imageUrls: unitImages,
          imageCaptions: [
            PHOTO_SLOT_LABELS[0],
            PHOTO_SLOT_LABELS[1],
            PHOTO_SLOT_LABELS[2],
          ],
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
          <div className="p-8 sm:p-10 text-center space-y-4">
            <p className="text-base font-semibold text-slate-900">
              กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อจัดการฐานข้อมูล
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              บุคคลทั่วไปสามารถเข้าชมข้อมูลหม้อแปลงได้โดยไม่ต้องเข้าสู่ระบบ
              ส่วนหน้าต่างนี้สงวนสิทธิ์สำหรับเจ้าหน้าที่แก้ไขข้อมูลใน Firestore เท่านั้น
            </p>
            <button
              type="button"
              disabled={authBusy}
              onClick={async () => {
                setAuthBusy(true);
                clearAuthError();
                try {
                  await signInWithGoogle();
                } catch {
                  // Error code is stored in FirebaseContext authErrorCode
                } finally {
                  setAuthBusy(false);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>{authBusy ? 'กำลังเปิดหน้าต่างเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}</span>
            </button>

            {authErrorCode && (
              <div className="max-w-lg mx-auto mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-left text-xs text-red-900 space-y-2">
                {authErrorCode === 'auth/unauthorized-domain' ? (
                  <>
                    <p className="font-bold text-red-800">
                      เข้าสู่ระบบไม่สำเร็จ: โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication
                    </p>
                    <p>
                      กรุณานำชื่อโดเมน{' '}
                      <code className="px-1.5 py-0.5 rounded bg-red-100 font-mono font-semibold text-red-950 select-all">
                        {typeof window !== 'undefined' ? window.location.hostname : 'your-app.vercel.app'}
                      </code>{' '}
                      ไปเพิ่มใน Firebase Console → Authentication → Settings → Authorized domains
                    </p>
                    <p>
                      <a
                        href="https://console.firebase.google.com/project/gen-lang-client-0929613659/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline text-red-800 hover:text-red-950"
                      >
                        เปิดหน้าตั้งค่า Authorized domains ใน Firebase Console
                      </a>
                    </p>
                  </>
                ) : authErrorCode === 'auth/popup-closed-by-user' ||
                  authErrorCode === 'auth/cancelled-popup-request' ? (
                  <p className="font-medium">
                    ปิดหน้าต่างเข้าสู่ระบบ Google ก่อนดำเนินการเสร็จสิ้น กรุณากดปุ่มเข้าสู่ระบบใหม่อีกครั้ง
                  </p>
                ) : (
                  <p className="font-medium break-all">
                    ไม่สามารถเข้าสู่ระบบได้ ({authErrorCode})
                  </p>
                )}
              </div>
            )}
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

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          ชื่อล็อต *
                        </label>
                        <input
                          type="text"
                          required
                          value={lotShortLabel}
                          onChange={(e) => setLotShortLabel(e.target.value)}
                          placeholder="เช่น ล็อตที่ 4 · หม้อแปลงจำหน่าย อ.ฝาง"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          จุดจัดเก็บ / สถานที่ *
                        </label>
                        <input
                          type="text"
                          required
                          value={lotLocation}
                          onChange={(e) => setLotLocation(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            วันที่เริ่ม (วันและเวลา) *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={lotStartDate}
                            onChange={(e) => setLotStartDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            วันที่สุดท้าย (วันและเวลา) *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={lotEndDate}
                            onChange={(e) => setLotEndDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          วันที่เปิดซอง (วันและเวลา) *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={lotBidOpeningAt}
                          onChange={(e) => setLotBidOpeningAt(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                        />
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
                          placeholder="รายละเอียดสภาพโดยรวมของหม้อแปลงในล็อต"
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
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {lot.shortLabel}
                              </p>
                              <p className="text-xs text-slate-500">
                                {lot.sourceLocation}
                              </p>
                              <p className="text-xs font-mono text-slate-700 tabular-nums">
                                เริ่ม: {formatThaiDateTime(lot.startDate)} · สุดท้าย:{' '}
                                {formatThaiDateTime(lot.endDate)}
                              </p>
                              <p className="text-xs font-mono text-amber-800 font-semibold tabular-nums">
                                เปิดซอง: {formatThaiDateTime(lot.bidOpeningAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditLot(lot)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`แก้ไข ${lot.shortLabel}`}
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLot(lot)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`ลบ ${lot.shortLabel}`}
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
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5"
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

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          สังกัดล็อต *
                        </label>
                        <select
                          value={
                            lots.some((l) => l.id === unitLotId)
                              ? unitLotId
                              : lots[0]?.id || ''
                          }
                          onChange={(e) => setUnitLotId(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        >
                          {lots.length === 0 ? (
                            <option value="">-- กรุณาสร้างล็อตสินค้าก่อน --</option>
                          ) : (
                            lots.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.shortLabel}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          PEA No. (รูปแบบ TRxx-xxxxxx) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          pattern="^TR[0-9]{2}-[0-9]{6}$"
                          title="ระบุในรูปแบบ TRxx-xxxxxx เช่น TR54-025018"
                          value={unitPeaNo}
                          onChange={(e) => setUnitPeaNo(e.target.value.toUpperCase())}
                          placeholder="TR54-025018"
                          className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            พิกัด (kVA) *
                          </label>
                          <select
                            value={
                              isCustomKva ||
                              !KVA_PRESET_OPTIONS.some((v) => String(v) === unitKva)
                                ? 'custom'
                                : unitKva
                            }
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setIsCustomKva(true);
                              } else {
                                setIsCustomKva(false);
                                setUnitKva(e.target.value);
                              }
                            }}
                            aria-label="เลือกพิกัด (kVA)"
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                          >
                            {KVA_PRESET_OPTIONS.map((kvaOption) => (
                              <option key={kvaOption} value={String(kvaOption)}>
                                {kvaOption} kVA
                              </option>
                            ))}
                            <option value="custom">ระบุค่าเอง...</option>
                          </select>
                          {(isCustomKva ||
                            !KVA_PRESET_OPTIONS.some((v) => String(v) === unitKva)) && (
                            <input
                              type="number"
                              required
                              min={1}
                              max={100000}
                              value={unitKva}
                              onChange={(e) => setUnitKva(e.target.value)}
                              placeholder="ระบุขนาด kVA เช่น 800"
                              aria-label="ระบุพิกัด kVA เอง"
                              className="mt-2 w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            เฟส *
                          </label>
                          <select
                            value={unitPhase}
                            onChange={(e) =>
                              setUnitPhase(e.target.value as TransformerPhase)
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="1 เฟส">1 เฟส</option>
                            <option value="3 เฟส">3 เฟส</option>
                          </select>
                        </div>
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

                      <div className="space-y-2.5 pt-1">
                        <p className="text-xs font-semibold text-slate-800">
                          แนบรูปภาพประกอบ 3 รูป *
                        </p>
                        {([0, 1, 2] as const).map((slotIdx) => {
                          const currentUrl = unitImages[slotIdx];
                          const isCustomUpload = currentUrl.startsWith('data:image/');
                          return (
                            <div
                              key={PHOTO_SLOT_LABELS[slotIdx]}
                              className="p-3 bg-white border border-slate-200 rounded-lg space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-800">
                                  {PHOTO_SLOT_LABELS[slotIdx]}
                                </span>
                                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">
                                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>อัปโหลดรูป</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => handlePhotoFileChange(slotIdx, e)}
                                  />
                                </label>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-20 h-14 rounded overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                  <ResilientImage
                                    src={currentUrl}
                                    alt={PHOTO_SLOT_LABELS[slotIdx]}
                                    fallbackTitle={PHOTO_SLOT_LABELS[slotIdx]}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <select
                                  value={isCustomUpload ? '__uploaded__' : currentUrl}
                                  onChange={(e) => {
                                    if (e.target.value !== '__uploaded__') {
                                      handlePhotoPresetChange(slotIdx, e.target.value);
                                    }
                                  }}
                                  aria-label={`เลือกรูป ${PHOTO_SLOT_LABELS[slotIdx]}`}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                                >
                                  {isCustomUpload && (
                                    <option value="__uploaded__">
                                      รูปที่อัปโหลดจากเครื่องแล้ว
                                    </option>
                                  )}
                                  {IMAGE_PRESETS.map((p) => (
                                    <option key={p.url} value={p.url}>
                                      {p.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          รายละเอียดเพิ่มเติม *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={unitSummary}
                          onChange={(e) => setUnitSummary(e.target.value)}
                          placeholder="สภาพตัวถัง ครีบระบายความร้อน หรือหมายเหตุเพิ่มเติม"
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
                      รายการหม้อแปลงทั้งหมด ({units.length} รายการ)
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
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                <ResilientImage
                                  src={unit.images[0]?.url || ''}
                                  alt={unit.peaNo}
                                  fallbackTitle={unit.peaNo}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-slate-600 truncate">
                                  {unit.lotCode} ·{' '}
                                  <span className="font-semibold text-slate-900">
                                    {unit.peaNo}
                                  </span>{' '}
                                  · จำนวน {unit.stockQty} เครื่อง
                                </p>
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  หม้อแปลงขนาด {unit.kva.toLocaleString('th-TH')} kVA · {unit.phase}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {unit.summaryNote}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditUnit(unit)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`แก้ไข ${unit.peaNo}`}
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(unit)}
                                disabled={Boolean(busyMessage)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                                aria-label={`ลบ ${unit.peaNo}`}
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

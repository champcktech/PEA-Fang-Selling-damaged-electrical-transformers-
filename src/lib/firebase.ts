import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  LOTS,
  TRANSFORMER_UNITS,
  TransformerCondition,
  TransformerLot,
  TransformerType,
  TransformerUnit,
} from '../data/transformers';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = 'champ5698@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

function sanitizeId(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
  return cleaned.slice(0, 64) || `item-${Date.now()}`;
}

export async function seedInitialCatalogToFirestore(options?: {
  excludeUnitId?: string;
  excludeLotId?: string;
}): Promise<void> {
  const batch = writeBatch(db);

  const lotsToWrite = options?.excludeLotId
    ? LOTS.filter((l) => l.id !== options.excludeLotId)
    : LOTS;
  const unitsToWrite = TRANSFORMER_UNITS.filter(
    (u) =>
      u.id !== options?.excludeUnitId &&
      u.lotId !== options?.excludeLotId
  );

  for (const lot of lotsToWrite) {
    const lotRef = doc(db, 'lots', lot.id);
    batch.set(lotRef, {
      id: lot.id,
      code: lot.code.slice(0, 40),
      name: lot.name.slice(0, 160),
      shortLabel: lot.shortLabel.slice(0, 80),
      sourceLocation: lot.sourceLocation.slice(0, 160),
      inspectedDate: lot.inspectedDate.slice(0, 60),
      kvaRange: lot.kvaRange.slice(0, 60),
      description: lot.description.slice(0, 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const unit of unitsToWrite) {
    const unitRef = doc(db, 'transformers', unit.id);
    batch.set(unitRef, {
      id: unit.id,
      lotId: unit.lotId,
      lotCode: unit.lotCode.slice(0, 40),
      sku: unit.sku.slice(0, 40),
      peaAssetNo: unit.peaAssetNo.slice(0, 60),
      title: unit.title.slice(0, 180),
      brand: unit.brand.slice(0, 80),
      type: unit.type,
      typeLabelTh: unit.typeLabelTh.slice(0, 80),
      condition: unit.condition,
      damageDetail: unit.damageDetail.slice(0, 240),
      kva: unit.kva,
      primaryVoltage: unit.primaryVoltage.slice(0, 40),
      secondaryVoltage: unit.secondaryVoltage.slice(0, 40),
      vectorGroup: unit.vectorGroup.slice(0, 30),
      frequency: unit.frequency.slice(0, 20),
      phase: unit.phase.slice(0, 30),
      cooling: unit.cooling.slice(0, 80),
      year: unit.year,
      weightKg: unit.weightKg,
      dimensionsMm: unit.dimensionsMm.slice(0, 80),
      stockQty: unit.stockQty,
      priceThb: unit.priceThb,
      summaryNote: unit.summaryNote.slice(0, 1000),
      imageUrls: unit.images.slice(0, 6).map((img) => img.url.slice(0, 500)),
      imageCaptions: unit.images.slice(0, 6).map((img) => img.caption.slice(0, 200)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  batch.set(doc(db, 'catalogMeta', 'status'), {
    initialized: true,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'lots,transformers,catalogMeta');
  }
}

export async function clearAllCatalogInFirestore(
  lotIds: string[],
  unitIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  for (const unitId of unitIds) {
    batch.delete(doc(db, 'transformers', unitId));
  }
  for (const lotId of lotIds) {
    batch.delete(doc(db, 'lots', lotId));
  }
  batch.set(doc(db, 'catalogMeta', 'status'), {
    initialized: true,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'lots,transformers');
  }
}

export async function saveLotToFirestore(
  lot: Omit<TransformerLot, 'id'> & { id?: string },
  isNew: boolean
): Promise<string> {
  const id = sanitizeId(lot.id || `lot-${Date.now()}`);
  const path = `lots/${id}`;
  try {
    if (isNew) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'lots', id), {
        id,
        code: lot.code.trim().slice(0, 40),
        name: lot.name.trim().slice(0, 160),
        shortLabel: lot.shortLabel.trim().slice(0, 80),
        sourceLocation: lot.sourceLocation.trim().slice(0, 160),
        inspectedDate: lot.inspectedDate.trim().slice(0, 60),
        kvaRange: lot.kvaRange.trim().slice(0, 60),
        description: lot.description.trim().slice(0, 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'catalogMeta', 'status'), {
        initialized: true,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } else {
      await updateDoc(doc(db, 'lots', id), {
        code: lot.code.trim().slice(0, 40),
        name: lot.name.trim().slice(0, 160),
        shortLabel: lot.shortLabel.trim().slice(0, 80),
        sourceLocation: lot.sourceLocation.trim().slice(0, 160),
        inspectedDate: lot.inspectedDate.trim().slice(0, 60),
        kvaRange: lot.kvaRange.trim().slice(0, 60),
        description: lot.description.trim().slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteLotFromFirestore(
  lotId: string,
  unitIdsInLot: string[] = []
): Promise<void> {
  const path = `lots/${lotId}`;
  try {
    const batch = writeBatch(db);
    for (const unitId of unitIdsInLot) {
      batch.delete(doc(db, 'transformers', unitId));
    }
    batch.delete(doc(db, 'lots', lotId));
    batch.set(doc(db, 'catalogMeta', 'status'), {
      initialized: true,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface SaveTransformerInput {
  id?: string;
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
  imageUrls: string[];
  imageCaptions: string[];
}

export async function saveTransformerToFirestore(
  input: SaveTransformerInput,
  isNew: boolean
): Promise<string> {
  const id = sanitizeId(input.id || `tr-${Date.now()}`);
  const path = `transformers/${id}`;
  const urls = input.imageUrls.filter(Boolean).slice(0, 6);
  const captions = input.imageCaptions.slice(0, 6);
  const safeUrls =
    urls.length > 0
      ? urls.map((u) => u.trim().slice(0, 500))
      : ['/src/assets/images/lot_pole_mounted_1794794274166.jpg'];
  const safeCaptions =
    captions.length === safeUrls.length
      ? captions.map((c) => (c.trim() || input.title).slice(0, 200))
      : safeUrls.map((_, idx) => `${input.title.slice(0, 140)} (รูปที่ ${idx + 1})`);

  const basePayload = {
    lotId: input.lotId,
    lotCode: input.lotCode.trim().slice(0, 40),
    sku: input.sku.trim().slice(0, 40),
    peaAssetNo: input.peaAssetNo.trim().slice(0, 60),
    title: input.title.trim().slice(0, 180),
    brand: input.brand.trim().slice(0, 80),
    type: input.type,
    typeLabelTh: input.typeLabelTh.trim().slice(0, 80),
    condition: input.condition,
    damageDetail: input.damageDetail.trim().slice(0, 240),
    kva: Math.max(1, Math.min(100000, Number(input.kva) || 100)),
    primaryVoltage: input.primaryVoltage.trim().slice(0, 40),
    secondaryVoltage: input.secondaryVoltage.trim().slice(0, 40),
    vectorGroup: input.vectorGroup.trim().slice(0, 30),
    frequency: input.frequency.trim().slice(0, 20),
    phase: input.phase.trim().slice(0, 30),
    cooling: input.cooling.trim().slice(0, 80),
    year: Math.max(1970, Math.min(2100, Number(input.year) || 2015)),
    weightKg: Math.max(10, Math.min(100000, Number(input.weightKg) || 800)),
    dimensionsMm: input.dimensionsMm.trim().slice(0, 80),
    stockQty: Math.max(0, Math.min(1000, Number(input.stockQty) || 0)),
    priceThb: Math.max(0, Math.min(100000000, Number(input.priceThb) || 0)),
    summaryNote: input.summaryNote.trim().slice(0, 1000),
    imageUrls: safeUrls,
    imageCaptions: safeCaptions,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'transformers', id), {
        id,
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'transformers', id), basePayload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteTransformerFromFirestore(unitId: string): Promise<void> {
  const path = `transformers/${unitId}`;
  try {
    await deleteDoc(doc(db, 'transformers', unitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function mapDocToTransformerLot(data: Record<string, unknown>, id: string): TransformerLot {
  return {
    id,
    code: String(data.code || ''),
    name: String(data.name || ''),
    shortLabel: String(data.shortLabel || ''),
    sourceLocation: String(data.sourceLocation || ''),
    inspectedDate: String(data.inspectedDate || ''),
    kvaRange: String(data.kvaRange || ''),
    description: String(data.description || ''),
  };
}

export function mapDocToTransformerUnit(
  data: Record<string, unknown>,
  id: string
): TransformerUnit {
  const urls = Array.isArray(data.imageUrls) ? (data.imageUrls as string[]) : [];
  const captions = Array.isArray(data.imageCaptions)
    ? (data.imageCaptions as string[])
    : [];

  return {
    id,
    lotId: String(data.lotId || ''),
    lotCode: String(data.lotCode || ''),
    sku: String(data.sku || ''),
    peaAssetNo: String(data.peaAssetNo || '-'),
    title: String(data.title || ''),
    brand: String(data.brand || ''),
    type: (data.type as TransformerType) || 'Oil-Immersed',
    typeLabelTh: String(data.typeLabelTh || ''),
    condition:
      (data.condition as TransformerCondition) || 'เก่า ชำรุด (ขายตามสภาพ)',
    damageDetail: String(data.damageDetail || '-'),
    kva: Number(data.kva || 0),
    primaryVoltage: String(data.primaryVoltage || ''),
    secondaryVoltage: String(data.secondaryVoltage || ''),
    vectorGroup: String(data.vectorGroup || ''),
    frequency: String(data.frequency || '50 Hz'),
    phase: String(data.phase || '3 เฟส'),
    cooling: String(data.cooling || ''),
    year: Number(data.year || 2015),
    weightKg: Number(data.weightKg || 0),
    dimensionsMm: String(data.dimensionsMm || ''),
    stockQty: Number(data.stockQty || 0),
    priceThb: Number(data.priceThb || 0),
    summaryNote: String(data.summaryNote || ''),
    images: urls.map((url, idx) => ({
      url,
      caption: captions[idx] || String(data.title || ''),
    })),
  };
}

export { collection };

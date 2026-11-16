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
  HERO_IMAGE,
  LOTS,
  PHOTO_SLOT_LABELS,
  TRANSFORMER_UNITS,
  TransformerLot,
  TransformerUnit,
} from '../data/transformers';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = 'champ5698@gmail.com';

const DEFAULT_SLOT_IMAGES = [
  '/images/lot_pole_mounted_1794794274166.jpg',
  HERO_IMAGE,
  '/images/detail_nameplate_bushing_1794794276341.jpg',
];

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
      shortLabel: lot.shortLabel.slice(0, 120),
      sourceLocation: lot.sourceLocation.slice(0, 160),
      startDate: lot.startDate.slice(0, 60),
      endDate: lot.endDate.slice(0, 60),
      bidOpeningAt: lot.bidOpeningAt.slice(0, 60),
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
      lotCode: unit.lotCode.slice(0, 80),
      peaNo: unit.peaNo.trim().toUpperCase(),
      kva: unit.kva,
      stockQty: unit.stockQty,
      summaryNote: unit.summaryNote.slice(0, 1000),
      imageUrls: [0, 1, 2].map((idx) =>
        (unit.images[idx]?.url || DEFAULT_SLOT_IMAGES[idx]).slice(0, 280000)
      ),
      imageCaptions: [...PHOTO_SLOT_LABELS],
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
        shortLabel: lot.shortLabel.trim().slice(0, 120),
        sourceLocation: lot.sourceLocation.trim().slice(0, 160),
        startDate: lot.startDate.trim().slice(0, 60),
        endDate: lot.endDate.trim().slice(0, 60),
        bidOpeningAt: lot.bidOpeningAt.trim().slice(0, 60),
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
        shortLabel: lot.shortLabel.trim().slice(0, 120),
        sourceLocation: lot.sourceLocation.trim().slice(0, 160),
        startDate: lot.startDate.trim().slice(0, 60),
        endDate: lot.endDate.trim().slice(0, 60),
        bidOpeningAt: lot.bidOpeningAt.trim().slice(0, 60),
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
  peaNo: string;
  kva: number;
  stockQty: number;
  summaryNote: string;
  imageUrls: [string, string, string];
  imageCaptions?: [string, string, string];
}

export async function saveTransformerToFirestore(
  input: SaveTransformerInput,
  isNew: boolean
): Promise<string> {
  const id = sanitizeId(input.id || `tr-${Date.now()}`);
  const path = `transformers/${id}`;
  const safeUrls = [0, 1, 2].map((idx) => {
    const raw = input.imageUrls[idx]?.trim() || DEFAULT_SLOT_IMAGES[idx];
    return raw.slice(0, 280000);
  });
  const safeCaptions = [0, 1, 2].map((idx) =>
    (input.imageCaptions?.[idx]?.trim() || PHOTO_SLOT_LABELS[idx]).slice(0, 200)
  );

  const basePayload = {
    lotId: input.lotId,
    lotCode: input.lotCode.trim().slice(0, 80),
    peaNo: input.peaNo.trim().toUpperCase().slice(0, 11),
    kva: Math.max(1, Math.min(100000, Number(input.kva) || 100)),
    stockQty: Math.max(0, Math.min(1000, Number(input.stockQty) || 0)),
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
    shortLabel: String(data.shortLabel || data.name || data.code || id),
    sourceLocation: String(data.sourceLocation || ''),
    startDate: String(data.startDate || ''),
    endDate: String(data.endDate || ''),
    bidOpeningAt: String(data.bidOpeningAt || ''),
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
    peaNo: String(data.peaNo || data.peaAssetNo || '-'),
    kva: Number(data.kva || 0),
    stockQty: Number(data.stockQty || 0),
    summaryNote: String(data.summaryNote || ''),
    images: [0, 1, 2].map((idx) => {
      const rawUrl = urls[idx] || DEFAULT_SLOT_IMAGES[idx];
      return {
        url: rawUrl.replace(/^\/src\/assets\/images\//, '/images/'),
        caption: captions[idx] || PHOTO_SLOT_LABELS[idx],
      };
    }),
  };
}

export { collection };

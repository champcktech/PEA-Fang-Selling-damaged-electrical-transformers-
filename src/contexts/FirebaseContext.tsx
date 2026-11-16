import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  LOTS as SEED_LOTS,
  TRANSFORMER_UNITS as SEED_UNITS,
  TransformerLot,
  TransformerUnit,
} from '../data/transformers';
import {
  ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  mapDocToTransformerLot,
  mapDocToTransformerUnit,
  testConnection,
} from '../lib/firebase';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authErrorCode: string | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
  lots: TransformerLot[];
  units: TransformerUnit[];
  isUsingFirestoreData: boolean;
  catalogLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  const [firestoreLots, setFirestoreLots] = useState<TransformerLot[]>([]);
  const [firestoreUnits, setFirestoreUnits] = useState<TransformerUnit[]>([]);
  const [catalogInitialized, setCatalogInitialized] = useState(false);
  const [lotsLoaded, setLotsLoaded] = useState(false);
  const [unitsLoaded, setUnitsLoaded] = useState(false);

  useEffect(() => {
    testConnection();
    getRedirectResult(auth).catch((err: unknown) => {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: string }).code)
          : 'auth/unknown';
      setAuthErrorCode(code);
    });
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthErrorCode(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  // Public read-only catalog listeners (no authentication required for buyers)
  useEffect(() => {
    const metaRef = doc(db, 'catalogMeta', 'status');
    const unsubscribeMeta = onSnapshot(
      metaRef,
      (snapshot) => {
        setCatalogInitialized(snapshot.exists() && Boolean(snapshot.data()?.initialized));
      },
      () => {
        setCatalogInitialized(false);
      }
    );

    const lotsQuery = query(collection(db, 'lots'));
    const unsubscribeLots = onSnapshot(
      lotsQuery,
      (snapshot) => {
        const nextLots = snapshot.docs
          .map((d) =>
            mapDocToTransformerLot(d.data() as Record<string, unknown>, d.id)
          )
          .sort((a, b) =>
            (a.startDate || a.shortLabel).localeCompare(
              b.startDate || b.shortLabel,
              'th'
            )
          );
        setFirestoreLots(nextLots);
        setLotsLoaded(true);
      },
      (error) => {
        setLotsLoaded(true);
        handleFirestoreError(error, OperationType.LIST, 'lots');
      }
    );

    const unitsQuery = query(collection(db, 'transformers'), orderBy('kva', 'desc'));
    const unsubscribeUnits = onSnapshot(
      unitsQuery,
      (snapshot) => {
        const nextUnits = snapshot.docs.map((d) =>
          mapDocToTransformerUnit(d.data() as Record<string, unknown>, d.id)
        );
        setFirestoreUnits(nextUnits);
        setUnitsLoaded(true);
      },
      (error) => {
        setUnitsLoaded(true);
        handleFirestoreError(error, OperationType.LIST, 'transformers');
      }
    );

    return () => {
      unsubscribeMeta();
      unsubscribeLots();
      unsubscribeUnits();
    };
  }, []);

  const isAdmin = Boolean(
    user && user.email === ADMIN_EMAIL && user.emailVerified
  );

  const signInWithGoogle = async () => {
    setAuthErrorCode(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: string }).code)
          : 'auth/unknown';
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      setAuthErrorCode(code);
      throw err;
    }
  };

  const signOutUser = async () => {
    setAuthErrorCode(null);
    await signOut(auth);
  };

  const clearAuthError = () => setAuthErrorCode(null);

  const isUsingFirestoreData =
    catalogInitialized || firestoreLots.length > 0 || firestoreUnits.length > 0;
  const catalogLoading = !lotsLoaded || !unitsLoaded;

  const lots = useMemo(
    () => (isUsingFirestoreData ? firestoreLots : SEED_LOTS),
    [isUsingFirestoreData, firestoreLots]
  );

  const units = useMemo(
    () => (isUsingFirestoreData ? firestoreUnits : SEED_UNITS),
    [isUsingFirestoreData, firestoreUnits]
  );

  const value: FirebaseContextValue = {
    user,
    authReady,
    authErrorCode,
    isAdmin,
    signInWithGoogle,
    signOutUser,
    clearAuthError,
    lots,
    units,
    isUsingFirestoreData,
    catalogLoading,
  };

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return ctx;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Les variables EXPO_PUBLIC_* sont injectées dans le bundle au moment de la compilation.
// Elles doivent être écrites en toutes lettres (pas de process.env[nom]).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error(
    'Configuration Firebase manquante : copie .env.example vers .env.local et renseigne les variables EXPO_PUBLIC_FIREBASE_*, puis relance le serveur avec « npm run dev -- --clear ».'
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createAuth(): Auth {
  try {
    // La session est conservée entre deux ouvertures de l'appli grâce à AsyncStorage.
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Après un rechargement à chaud, l'auth est déjà initialisée : on la récupère.
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
// À l'exécution, Metro utilise la version React Native de @firebase/auth, qui exporte
// getReactNativePersistence. Les types fournis par défaut sont ceux de la version web,
// qui ne la contiennent pas : on la déclare ici.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}

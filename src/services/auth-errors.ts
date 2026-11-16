import { FirebaseError } from 'firebase/app';

import type { AuthErrorInfo } from '@/types/auth';

const NETWORK: AuthErrorInfo = {
  field: 'form',
  message: 'Pas de connexion internet. Vérifiez votre réseau et réessayez.',
};

const INVALID_CREDENTIALS: AuthErrorInfo = {
  field: 'email',
  message: 'E-mail ou mot de passe incorrect',
};

/** Messages affichés à l'utilisateur, par code d'erreur Firebase Auth. */
const MESSAGES: Record<string, AuthErrorInfo> = {
  // Connexion
  'auth/invalid-credential': INVALID_CREDENTIALS,
  'auth/invalid-login-credentials': INVALID_CREDENTIALS,
  'auth/wrong-password': INVALID_CREDENTIALS,
  'auth/user-not-found': INVALID_CREDENTIALS,
  'auth/user-disabled': { field: 'form', message: 'Ce compte a été désactivé.' },
  'auth/too-many-requests': {
    field: 'form',
    message: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
  },

  'auth/requires-recent-login': {
    field: 'form',
    message: 'Par sécurité, déconnectez-vous puis reconnectez-vous avant de refaire cette action.',
  },

  // E-mail
  'auth/invalid-email': { field: 'email', message: 'Cette adresse e-mail n’est pas valide' },
  'auth/missing-email': { field: 'email', message: 'Entrez votre adresse e-mail' },
  'auth/email-already-in-use': {
    field: 'email',
    message: 'Un compte existe déjà avec cet e-mail. Essayez de vous connecter.',
  },

  // Mot de passe
  'auth/weak-password': {
    field: 'password',
    message: 'Mot de passe trop faible : choisissez-en un plus long (8 caractères minimum)',
  },
  'auth/missing-password': { field: 'password', message: 'Entrez votre mot de passe' },
  'auth/password-does-not-meet-requirements': {
    field: 'password',
    message: 'Ce mot de passe ne respecte pas les règles de sécurité demandées',
  },

  // Réseau
  'auth/network-request-failed': NETWORK,
  'auth/timeout': NETWORK,
};

/**
 * Erreurs de configuration du projet Firebase : sans rapport avec l'utilisateur.
 * En développement on explique quoi corriger, en production on reste neutre.
 */
const CONFIGURATION_HINTS: Record<string, string> = {
  'auth/configuration-not-found':
    'Firebase Authentication n’est pas initialisé. Console Firebase → Authentication → « Commencer ».',
  'auth/operation-not-allowed':
    'La connexion par e-mail n’est pas activée. Console Firebase → Authentication → Sign-in method → E-mail/Mot de passe.',
  'auth/invalid-api-key':
    'Clé API Firebase invalide. Vérifie EXPO_PUBLIC_FIREBASE_API_KEY dans .env.local, puis relance « npm run dev -- --clear ».',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Clé API Firebase invalide. Vérifie EXPO_PUBLIC_FIREBASE_API_KEY dans .env.local, puis relance « npm run dev -- --clear ».',
  'auth/app-not-authorized':
    'Cette application n’est pas autorisée à utiliser cette clé API Firebase. Vérifie les restrictions de la clé dans Google Cloud.',
  'auth/internal-error':
    'Erreur interne Firebase : vérifie que l’API « Identity Toolkit » est activée et que la clé API n’est pas restreinte.',
};

const CONFIGURATION_FALLBACK =
  'Le service de connexion est momentanément indisponible. Réessayez plus tard.';

/** Traduit une erreur Firebase Auth en message français pour l'utilisateur. */
export function describeAuthError(error: unknown): AuthErrorInfo {
  const code = error instanceof FirebaseError ? error.code : '';

  const known = MESSAGES[code];
  if (known) return known;

  const hint = CONFIGURATION_HINTS[code];
  if (hint) {
    if (__DEV__) console.warn(`[Auth] ${code} — ${hint}`);
    return { field: 'form', message: __DEV__ ? `${hint}` : CONFIGURATION_FALLBACK };
  }

  // Erreur inattendue : on garde le code visible pour que l'équipe puisse la diagnostiquer.
  if (__DEV__) console.warn('[Auth] Erreur non gérée :', error);
  return {
    field: 'form',
    message: code
      ? `Une erreur est survenue (${code}). Réessayez.`
      : 'Une erreur est survenue. Réessayez.',
  };
}

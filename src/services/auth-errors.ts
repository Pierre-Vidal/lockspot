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

// Messages affichés à l'utilisateur selon le code d'erreur de Firebase Auth
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

  // Firestore (suppression des coffres)
  'permission-denied': {
    field: 'form',
    message: 'Action refusée par la base de données : les règles de sécurité Firestore doivent autoriser le propriétaire à supprimer ses coffres.',
  },
  unavailable: NETWORK,

  // Réseau
  'auth/network-request-failed': NETWORK,
  'auth/timeout': NETWORK,
};

// Traduit une erreur Firebase en message français, avec un message général si on ne la connaît pas
export function describeAuthError(error: unknown): AuthErrorInfo {
  const code = error instanceof FirebaseError ? error.code : '';
  return MESSAGES[code] ?? { field: 'form', message: 'Une erreur est survenue. Réessayez.' };
}

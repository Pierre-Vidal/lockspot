import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { auth } from '@/services/firebase';
import type { AppUser } from '@/types/auth';

function toAppUser(user: User): AppUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName };
}

/** Appelle `callback` au démarrage (session restaurée), puis à chaque connexion / déconnexion. */
export function subscribeToAuthChanges(callback: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => callback(user ? toAppUser(user) : null));
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

/** Crée le compte et enregistre le nom d'utilisateur dans le profil. */
export async function signUp(username: string, email: string, password: string): Promise<AppUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await updateProfile(user, { displayName: username.trim() });
  } catch {
    // Le compte est créé : le nom d'utilisateur pourra être renseigné plus tard.
  }
  return toAppUser(user);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Supprime définitivement le compte connecté (Firebase déconnecte ensuite l'utilisateur). */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await deleteUser(user);
}

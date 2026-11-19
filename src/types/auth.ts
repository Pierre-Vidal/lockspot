export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

// Champ où afficher l'erreur, « form » pour un message général
export type AuthErrorField = 'email' | 'password' | 'form';

export type AuthErrorInfo = {
  field: AuthErrorField;
  message: string;
};

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

/** Champ du formulaire auquel rattacher le message d'erreur (`form` = message général). */
export type AuthErrorField = 'email' | 'password' | 'form';

export type AuthErrorInfo = {
  field: AuthErrorField;
  message: string;
};

import * as LocalAuthentication from 'expo-local-authentication';

export type ResultatBiometrie = { ok: true } | { ok: false; message: string | null };

const MESSAGE_SANS_VERROUILLAGE =
    'Activez Face ID, une empreinte ou un code sur votre téléphone pour pouvoir ouvrir vos coffres.';

const MESSAGES_ERREUR: Partial<Record<LocalAuthentication.LocalAuthenticationError, string | null>> = {
    user_cancel: null,
    system_cancel: null,
    app_cancel: null,
    lockout: 'Trop de tentatives. Déverrouillez votre téléphone, puis réessayez.',
    not_enrolled: MESSAGE_SANS_VERROUILLAGE,
    passcode_not_set: MESSAGE_SANS_VERROUILLAGE,
    not_available: MESSAGE_SANS_VERROUILLAGE,
};

export async function verifierIdentite(motif: string): Promise<ResultatBiometrie> {
    const niveau = await LocalAuthentication.getEnrolledLevelAsync();
    if (niveau === LocalAuthentication.SecurityLevel.NONE) {
        return { ok: false, message: MESSAGE_SANS_VERROUILLAGE };
    }

    const resultat = await LocalAuthentication.authenticateAsync({
        promptMessage: motif,
        cancelLabel: 'Annuler',
        fallbackLabel: 'Utiliser le code',
        disableDeviceFallback: false,
    });

    if (resultat.success) return { ok: true };

    const message = MESSAGES_ERREUR[resultat.error];
    return { ok: false, message: message === undefined ? 'Identité non vérifiée. Réessayez.' : message };
}
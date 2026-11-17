import * as LocalAuthentication from 'expo-local-authentication';

export type ResultatBiometrie = { ok: true } | { ok: false; message: string | null };

const MESSAGE_SANS_VERROUILLAGE =
    'Activez Face ID, une empreinte ou un code sur votre téléphone pour pouvoir ouvrir vos coffres.';

/**
 * Limite connue d'Android : après 5 empreintes ratées, Android ouvre sa propre page de code pour
 * débloquer l'empreinte et répond « annulé » à l'app, même si le code saisi est bon. L'app ne peut pas
 * distinguer ce cas d'une vraie annulation : le message guide l'utilisateur dans les deux cas.
 */
const MESSAGE_ANNULATION =
    'Coffre non ouvert. Si votre empreinte est bloquée, débloquez-la avec le code du téléphone, puis touchez à nouveau « Déverrouiller ».';

const MESSAGES_ERREUR: Partial<Record<LocalAuthentication.LocalAuthenticationError, string | null>> = {
    user_cancel: MESSAGE_ANNULATION,
    system_cancel: MESSAGE_ANNULATION,
    app_cancel: null,
    lockout: 'Trop de tentatives. Déverrouillez votre téléphone avec son code, puis réessayez.',
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
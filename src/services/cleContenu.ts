import { AESEncryptionKey } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const NOM_CLE = 'lockspot.cle-contenu.v1';

const OPTIONS: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

let cleEnCours: Promise<AESEncryptionKey> | null = null;

export function obtenirCle(): Promise<AESEncryptionKey> {
    cleEnCours ??= chargerOuCreerCle().catch((erreur: unknown) => {
        cleEnCours = null;
        throw erreur;
    });
    return cleEnCours;
}

async function chargerOuCreerCle(): Promise<AESEncryptionKey> {
    const cleEnregistree = await SecureStore.getItemAsync(NOM_CLE, OPTIONS);
    if (cleEnregistree) return AESEncryptionKey.import(cleEnregistree, 'base64');

    const nouvelleCle = await AESEncryptionKey.generate();
    await SecureStore.setItemAsync(NOM_CLE, await nouvelleCle.encoded('base64'), OPTIONS);
    return nouvelleCle;
}

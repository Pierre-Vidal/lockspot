import * as DocumentPicker from 'expo-document-picker';

import { pendantAppExterne } from '@/services/appExterne';
import type { SourceFichier } from '@/services/contenuCoffres';

// Choisir des fichiers avec le sélecteur du système
// On utilise expo-document-picker car il donne le vrai nom du fichier
// (avec File.pickFileAsync on obtenait « msf:1000012345 » au lieu de « facture.pdf »)
// Le sélecteur fait une copie temporaire dans le cache, effacée une fois le fichier chiffré
export async function choisirFichiers(): Promise<SourceFichier[]> {
    const resultat = await pendantAppExterne(() =>
        DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true, type: '*/*' }),
    );
    if (resultat.canceled) return [];
    return resultat.assets.map((fichier) => ({
        uri: fichier.uri,
        nom: fichier.name,
        typeMime: fichier.mimeType || 'application/octet-stream',
    }));
}

import * as DocumentPicker from 'expo-document-picker';

import { pendantAppExterne } from '@/services/appExterne';
import type { SourceFichier } from '@/services/contenuCoffres';

/**
 * N'importe quel fichier (PDF, document, photo…), via le sélecteur du système.
 * Le coffre en garde une copie chiffrée, sous le nom d'origine du fichier.
 *
 * On passe par expo-document-picker parce qu'il demande son vrai nom au système. Avec
 * `File.pickFileAsync` d'expo-file-system, le nom est déduit de l'adresse du fichier,
 * et sur Android elle ressemble à `content://…/document/msf%3A1000012345` : le fichier
 * s'appelait alors « msf:1000012345 » au lieu de « facture.pdf ».
 * Le sélecteur en fait aussi une copie temporaire dans le cache, effacée une fois le fichier chiffré.
 */
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

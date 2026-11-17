import { File } from 'expo-file-system';

import { pendantAppExterne } from '@/services/appExterne';
import type { SourceFichier } from '@/services/contenuCoffres';

/**
 * N'importe quel fichier (PDF, document, photo…), via le sélecteur du système.
 * L'original reste où il était : le coffre en garde une copie chiffrée.
 */
export async function choisirFichiers(): Promise<SourceFichier[]> {
    const resultat = await pendantAppExterne(() => File.pickFileAsync({ multipleFiles: true }));
    if (resultat.canceled) return [];
    return resultat.result.map((fichier) => ({
        uri: fichier.uri,
        nom: fichier.name,
        typeMime: fichier.type || 'application/octet-stream',
    }));
}
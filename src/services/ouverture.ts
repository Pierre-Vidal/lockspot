import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { pendantAppExterne } from '@/services/appExterne';
import { ErreurContenu, lireEnOctets } from '@/services/contenuCoffres';
import type { FichierCoffre } from '@/types/contenu';

const dossierOuvertures = () => new Directory(Paths.cache, 'ouvertures');

/**
 * Ouvre un fichier du coffre dans une autre app (lecteur PDF, Drive…).
 * Il faut pour cela une copie déchiffrée : elle reste dans le cache de l'app
 * et disparaît à l'ouverture suivante ou quand le coffre se verrouille.
 */
export async function ouvrirDansUneAutreApp(idCoffre: string, fichier: FichierCoffre) {
    if (!(await Sharing.isAvailableAsync())) {
        throw new ErreurContenu('Aucune application ne peut ouvrir ce fichier sur ce téléphone.');
    }

    effacerCopiesEnClair();
    const dossier = dossierOuvertures();
    dossier.create({ intermediates: true });
    // Le vrai nom garde l'extension : l'autre app s'en sert pour reconnaître le type de fichier.
    const copie = new File(dossier, fichier.nom.replace(/[\\/]/g, '_'));
    copie.create();
    copie.write(await lireEnOctets(idCoffre, fichier.id));

    await pendantAppExterne(() =>
        Sharing.shareAsync(copie.uri, { mimeType: fichier.typeMime, dialogTitle: `Ouvrir « ${fichier.nom} »` }),
    );
}

/**
 * On n'efface pas la copie dès le retour : certaines apps lisent encore le fichier après.
 */
export function effacerCopiesEnClair() {
    try {
        const dossier = dossierOuvertures();
        if (dossier.exists) dossier.delete();
    } catch {
        // Déjà supprimé par le système : rien à faire.
    }
}
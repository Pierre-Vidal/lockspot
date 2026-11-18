import { Directory, File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { pendantAppExterne } from '@/services/appExterne';
import { ErreurContenu, lireEnOctets } from '@/services/contenuCoffres';
import type { FichierCoffre } from '@/types/contenu';

const dossierOuvertures = () => new Directory(Paths.cache, 'ouvertures');

// Action Android « afficher ce fichier » : le système propose « Ouvrir avec… » ou lance l'appli par défaut.
const ACTION_AFFICHER = 'android.intent.action.VIEW';
// Autorise l'appli choisie à lire le fichier, le temps de l'ouverture (Intent.FLAG_GRANT_READ_URI_PERMISSION).
const DROIT_DE_LECTURE = 1;
const TYPE_INCONNU = 'application/octet-stream';

/**
 * Ouvre un fichier du coffre dans une autre app (lecteur PDF, Drive…).
 * Il faut pour cela une copie déchiffrée : elle reste dans le cache de l'app
 * et disparaît à l'ouverture suivante ou quand le coffre se verrouille.
 *
 * Sur Android, on « ouvre » le fichier au lieu de le « partager » : expo-sharing n'affiche que le
 * menu Partager (envoyer par message, par mail…), pas la liste des applications qui savent le lire.
 */
export async function ouvrirDansUneAutreApp(idCoffre: string, fichier: FichierCoffre) {
    effacerCopiesEnClair();
    const dossier = dossierOuvertures();
    dossier.create({ intermediates: true });
    // Le vrai nom garde l'extension : l'autre app s'en sert pour reconnaître le type de fichier.
    const copie = new File(dossier, fichier.nom.replace(/[\\/]/g, '_'));
    copie.create();
    copie.write(await lireEnOctets(idCoffre, fichier.id));

    if (Platform.OS === 'android') {
        try {
            await pendantAppExterne(() =>
                IntentLauncher.startActivityAsync(ACTION_AFFICHER, {
                    // Adresse sécurisée (FileProvider) : une adresse file:// serait refusée par Android.
                    data: copie.contentUri,
                    // Sans type précis, Android le déduit de l'extension du nom.
                    type: fichier.typeMime === TYPE_INCONNU ? undefined : fichier.typeMime,
                    flags: DROIT_DE_LECTURE,
                }),
            );
        } catch {
            throw new ErreurContenu('Aucune application ne peut ouvrir ce type de fichier. Installez un lecteur adapté, puis réessayez.');
        }
        return;
    }

    // Autres plateformes : la feuille de partage du système propose aussi « Ouvrir dans… ».
    if (!(await Sharing.isAvailableAsync())) {
        throw new ErreurContenu('Aucune application ne peut ouvrir ce fichier sur ce téléphone.');
    }
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

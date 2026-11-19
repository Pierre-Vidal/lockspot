import { Directory, File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { pendantAppExterne } from '@/services/appExterne';
import { ErreurContenu, lireEnOctets } from '@/services/contenuCoffres';
import type { FichierCoffre } from '@/types/contenu';

const dossierOuvertures = () => new Directory(Paths.cache, 'ouvertures');

// Action Android « afficher » : le système propose « Ouvrir avec… » ou lance l'appli par défaut
const ACTION_AFFICHER = 'android.intent.action.VIEW';
// Autorise l'appli choisie à lire le fichier le temps de l'ouverture
const DROIT_DE_LECTURE = 1;
const TYPE_INCONNU = 'application/octet-stream';

// Ouvre un fichier du coffre dans une autre app (lecteur PDF, Drive…)
// Il faut une copie déchiffrée : elle reste dans le cache jusqu'à la prochaine ouverture ou au verrouillage
// Sur Android on « ouvre » au lieu de « partager » : le partage ne propose pas les applis qui savent lire le fichier
export async function ouvrirDansUneAutreApp(idCoffre: string, fichier: FichierCoffre) {
    effacerCopiesEnClair();
    const dossier = dossierOuvertures();
    dossier.create({ intermediates: true });
    // Le vrai nom garde l'extension : l'autre app s'en sert pour reconnaître le type
    const copie = new File(dossier, fichier.nom.replace(/[\\/]/g, '_'));
    copie.create();
    copie.write(await lireEnOctets(idCoffre, fichier.id));

    if (Platform.OS === 'android') {
        try {
            await pendantAppExterne(() =>
                IntentLauncher.startActivityAsync(ACTION_AFFICHER, {
                    // Adresse sécurisée (FileProvider), Android refuse file://
                    data: copie.contentUri,
                    // Sans type précis, Android le devine avec l'extension
                    type: fichier.typeMime === TYPE_INCONNU ? undefined : fichier.typeMime,
                    flags: DROIT_DE_LECTURE,
                }),
            );
        } catch {
            throw new ErreurContenu('Aucune application ne peut ouvrir ce type de fichier. Installez un lecteur adapté, puis réessayez.');
        }
        return;
    }

    // Ailleurs, la feuille de partage propose aussi « Ouvrir dans… »
    if (!(await Sharing.isAvailableAsync())) {
        throw new ErreurContenu('Aucune application ne peut ouvrir ce fichier sur ce téléphone.');
    }
    await pendantAppExterne(() =>
        Sharing.shareAsync(copie.uri, { mimeType: fichier.typeMime, dialogTitle: `Ouvrir « ${fichier.nom} »` }),
    );
}

export function effacerCopiesEnClair() {
    try {
        const dossier = dossierOuvertures();
        if (dossier.exists) dossier.delete();
    } catch {
        // Déjà supprimé par le système, rien à faire
    }
}

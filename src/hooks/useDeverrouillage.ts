import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';

import { verifierIdentite } from '@/services/biometrie';
import { enregistrerOuverture } from '@/services/sessionsCoffres';
import type { Coffre, Coordonnees } from '@/types/coffre';
import { chercherCoffreAOuvrir, formaterDistance } from '@/utils/zones';

type Parametres = {
    coffres: Coffre[];
    position: Coordonnees | null;
    idCoffreSelectionne: string | null;
};

export function useDeverrouillage({ coffres, position, idCoffreSelectionne }: Parametres) {
    const [enCours, setEnCours] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    function refuser(texte: string) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setMessage(texte);
    }

    async function deverrouiller() {
        if (enCours) return;
        setMessage(null);

        if (!position) {
            refuser('Position inconnue : activez la localisation pour ouvrir un coffre.');
            return;
        }

        const recherche = chercherCoffreAOuvrir(coffres, position, idCoffreSelectionne);
        if (recherche.type === 'selection-hors-zone') {
            refuser(
                `Impossible d’ouvrir « ${recherche.coffre.nom} » : vous êtes hors de sa zone (à ${formaterDistance(recherche.distanceMetres)}).`,
            );
            return;
        }
        if (recherche.type === 'hors-zone') {
            refuser(
                recherche.plusProche && recherche.distanceMetres !== null
                    ? `Aucun coffre ici. Le plus proche, « ${recherche.plusProche.nom} », est à ${formaterDistance(recherche.distanceMetres)}.`
                    : 'Vous n’avez encore aucun coffre. Créez-en un avec « Nouveau coffre ».',
            );
            return;
        }

        const { coffre } = recherche;
        setEnCours(true);
        try {
            const resultat = await verifierIdentite(`Ouvrir « ${coffre.nom} »`);
            if (resultat.ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                enregistrerOuverture(coffre.id);
                router.push({ pathname: '/coffre/[id]', params: { id: coffre.id } });
            } else if (resultat.message) {
                refuser(resultat.message);
            }
        } catch {
            refuser('La vérification biométrique a échoué. Réessayez.');
        } finally {
            setEnCours(false);
        }
    }

    return { deverrouiller, enCours, message, effacerMessage: () => setMessage(null) };
}
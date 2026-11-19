import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import type { Coordonnees } from '@/types/coffre';

export type StatutPosition = 'chargement' | 'active' | 'refusee' | 'erreur';

type EtatPosition = {
    statut: StatutPosition;
    position: Coordonnees | null;
    precisionMetres: number | null;
};

export function usePositionUtilisateur(): EtatPosition & { rafraichir: () => void } {
    const [etat, setEtat] = useState<EtatPosition>({ statut: 'chargement', position: null, precisionMetres: null });
    const [tentative, setTentative] = useState(0);

    useEffect(() => {
        let abonnement: Location.LocationSubscription | null = null;
        let annule = false;

        function mettreAJour({ coords }: Location.LocationObject) {
            if (annule) return;
            setEtat({
                statut: 'active',
                position: { latitude: coords.latitude, longitude: coords.longitude },
                precisionMetres: coords.accuracy,
            });
        }

        async function demarrerSuivi() {
            try {
                const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();
                if (annule) return;
                if (!granted) {
                    setEtat({ statut: 'refusee', position: null, precisionMetres: null });
                    if (tentative > 0 && !canAskAgain) Linking.openSettings();
                    return;
                }

                const nouvelAbonnement = await Location.watchPositionAsync(
                    { accuracy: Location.LocationAccuracy.High, distanceInterval: 5 },
                    mettreAJour,
                );
                if (annule) {
                    nouvelAbonnement.remove();
                    return;
                }
                abonnement = nouvelAbonnement;

                Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.High })
                    .then(mettreAJour)
                    .catch(() => {
                        // Pas de nouvelle mesure : le suivi prendra le relais.
                    });
            } catch {
                if (!annule) setEtat({ statut: 'erreur', position: null, precisionMetres: null });
            }
        }

        demarrerSuivi();

        return () => {
            annule = true;
            abonnement?.remove();
        };
    }, [tentative]);

    function rafraichir() {
        setEtat((precedent) => ({ ...precedent, statut: 'chargement' }));
        setTentative((numero) => numero + 1);
    }

    return { ...etat, rafraichir };
}

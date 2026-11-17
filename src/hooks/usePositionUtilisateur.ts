import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { Coordonnees } from '@/types/coffre';

export type StatutPosition = 'chargement' | 'active' | 'refusee' | 'erreur';

type EtatPosition = {
    statut: StatutPosition;
    position: Coordonnees | null;
    precisionMetres: number | null;
};

export function usePositionUtilisateur(): EtatPosition {
    const [etat, setEtat] = useState<EtatPosition>({ statut: 'chargement', position: null, precisionMetres: null });

    useEffect(() => {
        let abonnement: Location.LocationSubscription | null = null;
        let annule = false;

        async function demarrerSuivi() {
            try {
                const { granted } = await Location.requestForegroundPermissionsAsync();
                if (annule) return;
                if (!granted) {
                    setEtat({ statut: 'refusee', position: null, precisionMetres: null });
                    return;
                }

                const nouvelAbonnement = await Location.watchPositionAsync(
                    { accuracy: Location.LocationAccuracy.High, distanceInterval: 5 },
                    ({ coords }) => {
                        setEtat({
                            statut: 'active',
                            position: { latitude: coords.latitude, longitude: coords.longitude },
                            precisionMetres: coords.accuracy,
                        });
                    },
                );

                if (annule) nouvelAbonnement.remove();
                else abonnement = nouvelAbonnement;
            } catch {
                if (!annule) setEtat({ statut: 'erreur', position: null, precisionMetres: null });
            }
        }

        demarrerSuivi();

        return () => {
            annule = true;
            abonnement?.remove();
        };
    }, []);

    return etat;
}
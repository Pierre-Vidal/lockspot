import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { Coordonnees } from '@/types/coffre';

/**
 * Dernière position connue de l'appareil, relue à chaque fois que l'écran s'affiche.
 * Contrairement à usePositionUtilisateur, elle ne démarre pas de suivi GPS et ne demande
 * aucune permission : sans autorisation ou sans position récente, elle renvoie `null`.
 */
export function usePositionRecente(): Coordonnees | null {
    const [position, setPosition] = useState<Coordonnees | null>(null);

    useFocusEffect(
        useCallback(() => {
            let annule = false;

            async function lirePosition() {
                try {
                    const permission = await Location.getForegroundPermissionsAsync();
                    if (!permission.granted) return;
                    const derniere = await Location.getLastKnownPositionAsync();
                    if (!annule && derniere) {
                        setPosition({ latitude: derniere.coords.latitude, longitude: derniere.coords.longitude });
                    }
                } catch {
                    // Position indisponible : on n'affiche simplement pas « À proximité ».
                }
            }

            lirePosition();
            return () => {
                annule = true;
            };
        }, []),
    );

    return position;
}

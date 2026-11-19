import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { envoyerNotificationEntreeDansLaZone } from '@/services/notifications';
import { lireNotificationsActives } from '@/services/preferences';
import type { Coffre } from '@/types/coffre';

const TACHE_GEOREPERAGE = 'lockspot-georeperage';
const CLE_ZONES = 'lockspot:zones';

type ZoneEnregistree = { id: string; nom: string };

type EvenementZone = {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
};

// Le système lance cette tâche quand on entre dans une zone
// Hors composant, elle ne peut pas lire l'état de l'appli : on relit les noms enregistrés
TaskManager.defineTask<EvenementZone>(TACHE_GEOREPERAGE, async ({ data, error }) => {
    if (error || !data || data.eventType !== Location.GeofencingEventType.Enter) return;
    if (!(await lireNotificationsActives())) return;

    const idCoffre = data.region.identifier;
    if (!idCoffre) return;

    try {
        const texte = await AsyncStorage.getItem(CLE_ZONES);
        const zones = texte ? (JSON.parse(texte) as ZoneEnregistree[]) : [];
        const zone = zones.find((candidate) => candidate.id === idCoffre);
        if (zone) await envoyerNotificationEntreeDansLaZone(zone.id, zone.nom);
    } catch (erreur) {
        console.warn('Notification de proximité impossible', erreur);
    }
});

export async function permissionArrierePlanAccordee(): Promise<boolean> {
    return (await Location.getBackgroundPermissionsAsync()).granted;
}

// Demande la position « tout le temps » pour être prévenu en arrière-plan
// Sur Android 11+, le système renvoie vers les réglages de l'appli
export async function demanderPermissionArrierePlan(): Promise<boolean> {
    const premierPlan = await Location.requestForegroundPermissionsAsync();
    if (!premierPlan.granted) return false;
    return (await Location.requestBackgroundPermissionsAsync()).granted;
}

// Évite de réenregistrer les mêmes zones à chaque mise à jour
let signatureEnregistree = '';

// Surveille un cercle autour de chaque coffre (rien sans la permission « tout le temps »)
export async function synchroniserZones(coffres: Coffre[]): Promise<void> {
    if (coffres.length === 0 || !(await permissionArrierePlanAccordee())) {
        await arreterGeoreperage();
        return;
    }

    // Les noms peuvent changer sans que les zones bougent, donc on les met toujours à jour
    const zones: ZoneEnregistree[] = coffres.map(({ id, nom }) => ({ id, nom }));
    await AsyncStorage.setItem(CLE_ZONES, JSON.stringify(zones));

    const signature = coffres
        .map(({ id, coordonnees }) => `${id}:${coordonnees.latitude},${coordonnees.longitude}`)
        .sort()
        .join('|');
    if (signature === signatureEnregistree && (await Location.hasStartedGeofencingAsync(TACHE_GEOREPERAGE))) return;

    await Location.startGeofencingAsync(
        TACHE_GEOREPERAGE,
        coffres.map(({ id, coordonnees }) => ({
            identifier: id,
            latitude: coordonnees.latitude,
            longitude: coordonnees.longitude,
            // Même rayon que l'ouverture : on prévient seulement quand on peut ouvrir le coffre
            radius: RAYON_ZONE_METRES,
            notifyOnEnter: true,
            notifyOnExit: false,
        })),
    );
    signatureEnregistree = signature;
}

export async function arreterGeoreperage(): Promise<void> {
    signatureEnregistree = '';
    if (await Location.hasStartedGeofencingAsync(TACHE_GEOREPERAGE)) {
        await Location.stopGeofencingAsync(TACHE_GEOREPERAGE);
    }
    await AsyncStorage.removeItem(CLE_ZONES);
}

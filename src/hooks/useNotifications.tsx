import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { useAuth } from '@/hooks/use-auth';
import { useCoffres } from '@/hooks/useCoffres';
import {
    arreterGeoreperage,
    demanderPermissionArrierePlan,
    permissionArrierePlanAccordee,
    synchroniserZones,
} from '@/services/georeperage';
import {
    demanderPermissionNotifications,
    envoyerNotificationDansLaZone,
    permissionNotificationsAccordee,
} from '@/services/notifications';
import { ecrireNotificationsActives, lireNotificationsActives } from '@/services/preferences';
import type { Coordonnees } from '@/types/coffre';
import { estDansZone } from '@/utils/geo';

// Résultat de la demande d'activation, pour que l'écran sache quoi dire
export type ResultatActivation = 'ok' | 'notifications-refusees' | 'position-arriere-plan-refusee';

type ValeurNotifications = {
    // Voulues par l'utilisateur ET autorisées par le téléphone
    actives: boolean;
    changer: (actives: boolean) => Promise<ResultatActivation>;
    // À appeler après avoir créé ou déplacé un coffre : prévient tout de suite si on est dans sa zone
    notifierSiDansLaZone: (
        nomCoffre: string,
        coordonnees: Coordonnees,
        position: Coordonnees | null,
        idCoffre?: string,
    ) => void;
};

const ContexteNotifications = createContext<ValeurNotifications | null>(null);

// Gère l'interrupteur « Notifications » et la surveillance des zones
// Elle tourne si l'utilisateur est connecté, a activé les alertes et a donné la position « tout le temps »
export function NotificationsProvider({ children }: Readonly<{ children: ReactNode }>) {
    const { user } = useAuth();
    const { coffres, chargement: chargementCoffres } = useCoffres();
    const [souhaitees, setSouhaitees] = useState(false);
    const [permissionNotifications, setPermissionNotifications] = useState(false);
    const [permissionArrierePlan, setPermissionArrierePlan] = useState(false);

    // Au démarrage et à chaque retour dans l'appli (ex. après les réglages du téléphone)
    useEffect(() => {
        let actif = true;

        async function rafraichir() {
            const [choix, notifications, arrierePlan] = await Promise.all([
                lireNotificationsActives(),
                permissionNotificationsAccordee(),
                permissionArrierePlanAccordee(),
            ]);
            if (!actif) return;
            setSouhaitees(choix);
            setPermissionNotifications(notifications);
            setPermissionArrierePlan(arrierePlan);
        }

        rafraichir().catch(() => {});
        const abonnement = AppState.addEventListener('change', (etat) => {
            if (etat === 'active') rafraichir().catch(() => {});
        });
        return () => {
            actif = false;
            abonnement.remove();
        };
    }, []);

    const actives = souhaitees && permissionNotifications;
    const surveillance = Boolean(user) && actives && permissionArrierePlan;

    // Garde les zones à jour : coffre créé, déplacé, renommé ou supprimé
    useEffect(() => {
        if (!surveillance) {
            arreterGeoreperage().catch(() => {});
            return;
        }
        if (chargementCoffres) return;
        synchroniserZones(coffres).catch((erreur) => console.warn('Surveillance des zones impossible', erreur));
    }, [surveillance, coffres, chargementCoffres]);

    async function changer(voulues: boolean): Promise<ResultatActivation> {
        if (!voulues) {
            await ecrireNotificationsActives(false);
            setSouhaitees(false);
            return 'ok';
        }

        const accordee = await demanderPermissionNotifications();
        setPermissionNotifications(accordee);
        if (!accordee) return 'notifications-refusees';

        await ecrireNotificationsActives(true);
        setSouhaitees(true);

        // Sans la position « tout le temps », les alertes marchent seulement appli ouverte
        const arrierePlan = await demanderPermissionArrierePlan();
        setPermissionArrierePlan(arrierePlan);
        return arrierePlan ? 'ok' : 'position-arriere-plan-refusee';
    }

    function notifierSiDansLaZone(
        nomCoffre: string,
        coordonnees: Coordonnees,
        position: Coordonnees | null,
        idCoffre?: string,
    ) {
        if (!actives || !position || !estDansZone(position, coordonnees, RAYON_ZONE_METRES)) return;
        envoyerNotificationDansLaZone(nomCoffre, idCoffre).catch((erreur) => console.warn('Notification impossible', erreur));
    }

    return (
        <ContexteNotifications value={{ actives, changer, notifierSiDansLaZone }}>{children}</ContexteNotifications>
    );
}

export function useNotifications(): ValeurNotifications {
    const contexte = useContext(ContexteNotifications);
    if (!contexte) {
        throw new Error('useNotifications doit être utilisé à l’intérieur de <NotificationsProvider>.');
    }
    return contexte;
}

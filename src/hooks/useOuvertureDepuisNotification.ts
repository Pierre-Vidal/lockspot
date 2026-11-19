import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';

import { OUVRIR_COFFRE_DANS_LA_ZONE } from '@/constants/notifications';

// Quand on touche une de nos notifications, on va sur la carte avec le paramètre « ouvrir »
// La carte tente alors d'ouvrir le coffre (position, zone, biométrie), comme le bouton « Déverrouiller »
export function useOuvertureDepuisNotification(): void {
    const reponse = Notifications.useLastNotificationResponse();
    const etatNavigation = useRootNavigationState();
    const navigationPrete = Boolean(etatNavigation?.key);

    useEffect(() => {
        if (!reponse || !navigationPrete) return;
        if (reponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

        const donnees = reponse.notification.request.content.data;
        if (donnees?.ouvrirCoffre !== true) return;

        const idCoffre = typeof donnees.coffreId === 'string' ? donnees.coffreId : OUVRIR_COFFRE_DANS_LA_ZONE;
        // Pour ne pas rouvrir le coffre à chaque rendu, ni à la prochaine connexion
        Notifications.clearLastNotificationResponse();
        router.navigate({ pathname: '/', params: { ouvrir: idCoffre } });
    }, [reponse, navigationPrete]);
}

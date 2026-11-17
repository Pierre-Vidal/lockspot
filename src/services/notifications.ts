import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { DELAI_ANTI_DOUBLON_MS, DELAI_ENTRE_NOTIFICATIONS_MS } from '@/constants/notifications';

const CANAL_COFFRES = 'coffres';
const CLE_DERNIERE_IMMEDIATE = 'lockspot:notifications:derniere-immediate';
const cleCoffre = (idCoffre: string) => `lockspot:notifications:coffre:${idCoffre}`;

async function creerCanalAndroid(): Promise<void> {
    // Sans effet sur iOS. Sur Android 13+, la demande de permission exige qu'un canal existe déjà.
    await Notifications.setNotificationChannelAsync(CANAL_COFFRES, {
        name: 'Coffres à ouvrir',
        importance: Notifications.AndroidImportance.HIGH,
    });
}

/** À appeler une fois au démarrage : affiche aussi les notifications quand l'appli est ouverte. */
export function configurerNotifications(): void {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            // Sur Android, sans son, la bannière ne s'affiche pas quand l'appli est ouverte.
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
    creerCanalAndroid().catch(() => {});
}

export async function permissionNotificationsAccordee(): Promise<boolean> {
    return (await Notifications.getPermissionsAsync()).granted;
}

/** Demande l'autorisation d'envoyer des notifications. Renvoie `true` si elle est accordée. */
export async function demanderPermissionNotifications(): Promise<boolean> {
    await creerCanalAndroid();
    if (await permissionNotificationsAccordee()) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * `ouvrirCoffre` repère nos notifications quand l'utilisateur les touche (voir
 * useOuvertureDepuisNotification). `coffreId` désigne le coffre à ouvrir, s'il est connu.
 */
async function afficher(nomCoffre: string, idCoffre?: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `Vous êtes dans la zone de « ${nomCoffre} »`,
            body: 'Touchez pour ouvrir ce coffre.',
            data: idCoffre ? { ouvrirCoffre: true, coffreId: idCoffre } : { ouvrirCoffre: true },
        },
        trigger: { channelId: CANAL_COFFRES },
    });
}

async function dateDeLaDerniere(cle: string): Promise<number> {
    const texte = await AsyncStorage.getItem(cle);
    return texte ? Number(texte) : 0;
}

/**
 * Notification immédiate : l'utilisateur vient de créer ou de déplacer un coffre là où il se trouve.
 * `idCoffre` est inconnu à la création : toucher la notification ouvre alors le coffre de la zone.
 */
export async function envoyerNotificationDansLaZone(nomCoffre: string, idCoffre?: string): Promise<void> {
    await AsyncStorage.setItem(CLE_DERNIERE_IMMEDIATE, String(Date.now()));
    await afficher(nomCoffre, idCoffre);
}

/**
 * Notification de la surveillance en arrière-plan : l'utilisateur vient d'entrer dans la zone d'un coffre.
 * Elle n'est pas envoyée si une notification immédiate vient de partir, ni si ce coffre a déjà
 * prévenu récemment (la surveillance peut signaler la même entrée plusieurs fois).
 */
export async function envoyerNotificationEntreeDansLaZone(idCoffre: string, nomCoffre: string): Promise<void> {
    const maintenant = Date.now();
    if (maintenant - (await dateDeLaDerniere(CLE_DERNIERE_IMMEDIATE)) < DELAI_ANTI_DOUBLON_MS) return;
    if (maintenant - (await dateDeLaDerniere(cleCoffre(idCoffre))) < DELAI_ENTRE_NOTIFICATIONS_MS) return;

    await AsyncStorage.setItem(cleCoffre(idCoffre), String(maintenant));
    await afficher(nomCoffre, idCoffre);
}

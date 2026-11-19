import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { DELAI_ANTI_DOUBLON_MS, DELAI_ENTRE_NOTIFICATIONS_MS } from '@/constants/notifications';

const CANAL_COFFRES = 'coffres';
const CLE_DERNIERE_IMMEDIATE = 'lockspot:notifications:derniere-immediate';
const cleCoffre = (idCoffre: string) => `lockspot:notifications:coffre:${idCoffre}`;

async function creerCanalAndroid(): Promise<void> {
    // Android 13+ demande qu'un canal existe avant la permission
    await Notifications.setNotificationChannelAsync(CANAL_COFFRES, {
        name: 'Coffres à ouvrir',
        importance: Notifications.AndroidImportance.HIGH,
    });
}

// À appeler au démarrage, pour voir les notifications même appli ouverte
export function configurerNotifications(): void {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            // Sans son, Android n'affiche pas la bannière quand l'appli est ouverte
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
    creerCanalAndroid().catch(() => {});
}

export async function permissionNotificationsAccordee(): Promise<boolean> {
    return (await Notifications.getPermissionsAsync()).granted;
}

// Demande la permission, renvoie true si elle est accordée
export async function demanderPermissionNotifications(): Promise<boolean> {
    await creerCanalAndroid();
    if (await permissionNotificationsAccordee()) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
}

// ouvrirCoffre sert à reconnaître nos notifications au clic, coffreId à savoir quel coffre ouvrir
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

// Coffre créé ou déplacé là où on se trouve : on prévient tout de suite
// À la création on ne connaît pas encore l'id, le clic ouvre alors le coffre de la zone
export async function envoyerNotificationDansLaZone(nomCoffre: string, idCoffre?: string): Promise<void> {
    await AsyncStorage.setItem(CLE_DERNIERE_IMMEDIATE, String(Date.now()));
    await afficher(nomCoffre, idCoffre);
}

// Arrivée dans la zone d'un coffre (surveillance en arrière-plan)
// Pas de doublon si une notification vient de partir ou si ce coffre a déjà prévenu récemment
export async function envoyerNotificationEntreeDansLaZone(idCoffre: string, nomCoffre: string): Promise<void> {
    const maintenant = Date.now();
    if (maintenant - (await dateDeLaDerniere(CLE_DERNIERE_IMMEDIATE)) < DELAI_ANTI_DOUBLON_MS) return;
    if (maintenant - (await dateDeLaDerniere(cleCoffre(idCoffre))) < DELAI_ENTRE_NOTIFICATIONS_MS) return;

    await AsyncStorage.setItem(cleCoffre(idCoffre), String(maintenant));
    await afficher(nomCoffre, idCoffre);
}

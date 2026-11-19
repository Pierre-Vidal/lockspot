import AsyncStorage from '@react-native-async-storage/async-storage';

const CLE_NOTIFICATIONS_ACTIVES = 'lockspot:notifications-actives';

// Choix de l'utilisateur pour les alertes, désactivées par défaut
export async function lireNotificationsActives(): Promise<boolean> {
    try {
        return (await AsyncStorage.getItem(CLE_NOTIFICATIONS_ACTIVES)) === 'oui';
    } catch {
        return false;
    }
}

export async function ecrireNotificationsActives(actives: boolean): Promise<void> {
    await AsyncStorage.setItem(CLE_NOTIFICATIONS_ACTIVES, actives ? 'oui' : 'non');
}

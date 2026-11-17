// On importe chaque graisse séparément : un import groupé embarquerait toutes les graisses dans l'appli.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { couleurs } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { NotificationsProvider } from '@/hooks/useNotifications';
import { useOuvertureDepuisNotification } from '@/hooks/useOuvertureDepuisNotification';
// Importé pour définir la tâche de surveillance des zones au chargement de l'appli (voir le fichier).
import '@/services/georeperage';
import { initialiserMapbox } from '@/services/mapbox';
import { configurerNotifications } from '@/services/notifications';

// Exécuté une seule fois, au chargement de l'app, avant le premier affichage.
initialiserMapbox();
configurerNotifications();

// Le splash reste affiché tant que les polices et la session ne sont pas prêtes.
SplashScreen.preventAutoHideAsync();

export default function LayoutRacine() {
    const [policesChargees, erreurPolices] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
        Manrope_800ExtraBold,
    });

    if (!policesChargees && !erreurPolices) return null;

    return (
        <AuthProvider>
            <NotificationsProvider>
                <StatusBar style="dark" />
                <GardeConnexion />
            </NotificationsProvider>
        </AuthProvider>
    );
}

/** Affiche l'appli si l'utilisateur est connecté, l'écran de connexion sinon. */
function GardeConnexion() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) SplashScreen.hideAsync();
    }, [loading]);

    // Une notification touchée sans être connecté ne doit pas ouvrir un coffre après la prochaine connexion.
    useEffect(() => {
        if (!loading && !user) Notifications.clearLastNotificationResponse();
    }, [loading, user]);

    // Firebase restaure la session au démarrage : on n'affiche rien avant de savoir.
    if (loading) return null;

    return (
        <>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.fond } }}>
                <Stack.Protected guard={Boolean(user)}>
                    <Stack.Screen name="(onglets)" />
                    <Stack.Screen name="nouveau-coffre" options={{ animation: 'slide_from_bottom' }} />
                    {/* Pas de geste de retour : on ferme le coffre avec les boutons, qui le verrouillent. */}
                    <Stack.Screen name="coffre/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
                    <Stack.Screen name="modifier-coffre" options={{ animation: 'slide_from_bottom' }} />
                </Stack.Protected>
                <Stack.Protected guard={!user}>
                    <Stack.Screen name="login" />
                </Stack.Protected>
            </Stack>
            {user ? <OuvertureDepuisNotification /> : null}
        </>
    );
}

/** Rien à afficher : ce composant écoute seulement les appuis sur les notifications. */
function OuvertureDepuisNotification() {
    useOuvertureDepuisNotification();
    return null;
}

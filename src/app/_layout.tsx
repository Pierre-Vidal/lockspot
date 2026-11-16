// On importe chaque graisse séparément : un import groupé embarquerait toutes les graisses dans l'appli.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { couleurs } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { initialiserMapbox } from '@/services/mapbox';

initialiserMapbox();

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
            <StatusBar style="dark" />
            <GardeConnexion />
        </AuthProvider>
    );
}

function GardeConnexion() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) SplashScreen.hideAsync();
    }, [loading]);

    if (loading) return null;

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.fond } }}>
            <Stack.Protected guard={Boolean(user)}>
                <Stack.Screen name="(onglets)" />
                <Stack.Screen name="nouveau-coffre" options={{ animation: 'slide_from_bottom' }} />
            </Stack.Protected>
            <Stack.Protected guard={!user}>
                <Stack.Screen name="login" />
            </Stack.Protected>
        </Stack>
    );
}

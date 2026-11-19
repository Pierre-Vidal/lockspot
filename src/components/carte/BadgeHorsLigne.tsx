import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, typographie } from '@/constants/theme';

export function BadgeHorsLigne() {
    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            accessibilityRole="text"
            accessibilityLabel="Hors ligne. Les coffres affichés sont ceux enregistrés sur le téléphone."
            accessibilityLiveRegion="polite"
            style={styles.badge}>
            <Icone nom="horsLigne" couleur={couleurs.attention} taille={13} />
            <Text style={styles.libelle}>Hors ligne</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.xs + 2,
        paddingVertical: espacements.xs + 2,
        paddingHorizontal: espacements.sm + 4,
        borderRadius: arrondis.pilule,
        backgroundColor: couleurs.surface,
    },
    libelle: { ...typographie.legende, color: couleurs.attention, fontWeight: '600' },
});
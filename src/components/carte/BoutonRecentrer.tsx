import { Pressable, StyleSheet } from 'react-native';

import { Icone } from '@/components/Icone';
import { couleurs } from '@/constants/theme';

type Props = {
    onPress: () => void;
};

export function BoutonRecentrer({ onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Recentrer la carte"
            // Zone d'appui élargie : plus facile à toucher qu'un bouton de 44 points seul.
            hitSlop={8}
            style={({ pressed }) => [styles.bouton, pressed && styles.appuye]}>
            <Icone nom="recentrer" couleur={couleurs.principale} taille={20} />
        </Pressable>
    );
}

const TAILLE = 44;

const styles = StyleSheet.create({
    bouton: {
        width: TAILLE,
        height: TAILLE,
        borderRadius: TAILLE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.surface,
        boxShadow: '0 4px 12px rgba(28, 41, 38, 0.15)',
    },
    appuye: { transform: [{ scale: 0.92 }] },
});
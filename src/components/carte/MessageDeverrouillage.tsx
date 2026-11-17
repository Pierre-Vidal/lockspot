import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';

const DUREE_AFFICHAGE_MS = 5000;

type Props = {
    message: string;
    onFermer: () => void;
};

export function MessageDeverrouillage({ message, onFermer }: Props) {
    useEffect(() => {
        const minuteur = setTimeout(onFermer, DUREE_AFFICHAGE_MS);
        return () => clearTimeout(minuteur);
    }, [message, onFermer]);

    return (
        <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(150)}>
            <Pressable
                onPress={onFermer}
                accessibilityRole="alert"
                accessibilityLabel={message}
                accessibilityHint="Touchez pour fermer"
                style={styles.message}>
                <Icone nom="cadenas" couleur={couleurs.attention} taille={16} />
                <Text style={styles.texte}>{message}</Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    message: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.sm + 2,
        paddingHorizontal: espacements.md,
        paddingVertical: espacements.sm + 4,
        borderRadius: arrondis.md,
        backgroundColor: couleurs.surface,
        boxShadow: '0 6px 18px rgba(28, 41, 38, 0.14)',
    },
    texte: { flex: 1, fontFamily: polices.semiGras, fontSize: 13, lineHeight: 18, color: couleurs.texte },
});
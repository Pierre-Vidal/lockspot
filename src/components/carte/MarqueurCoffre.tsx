import { Pressable, StyleSheet, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { couleurs } from '@/constants/theme';

type Props = {
    nom: string;
    selectionne: boolean;
    onPress: () => void;
};

/**
 * Épingle en forme de goutte : un carré à trois coins arrondis,
 * tourné de 45° pour que le coin pointu soit en bas.
 */
export function MarqueurCoffre({ nom, onPress }: Props) {
    return (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Coffre ${nom}`} style={styles.zoneAppui}>
            <View style={styles.goutte}>
                {/* On annule la rotation pour que l'icône reste droite. */}
                <View style={styles.contreRotation}>
                    <Icone nom="cadenas" couleur={couleurs.surface} taille={16} />
                </View>
            </View>
        </Pressable>
    );
}

const TAILLE = 34;

const styles = StyleSheet.create({
    zoneAppui: {
        // La pointe dépasse du carré après rotation : on lui laisse de la place.
        paddingBottom: TAILLE * 0.25,
        paddingHorizontal: TAILLE * 0.2,
    },
    goutte: {
        width: TAILLE,
        height: TAILLE,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principale,
        borderTopLeftRadius: TAILLE / 2,
        borderTopRightRadius: TAILLE / 2,
        borderBottomLeftRadius: TAILLE / 2,
        transform: [{ rotate: '45deg' }],
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
    },
    contreRotation: { transform: [{ rotate: '-45deg' }] },
});
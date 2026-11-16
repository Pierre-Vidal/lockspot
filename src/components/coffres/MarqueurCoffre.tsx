import { Pressable, StyleSheet } from 'react-native';

import { EpingleCoffre } from '@/components/coffres/EpingleCoffre';

type Props = {
    nom: string;
    selectionne: boolean;
    onPress: () => void;
};

const TAILLE = 34;

export function MarqueurCoffre({ nom, selectionne, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Coffre ${nom}`}
            accessibilityState={{ selected: selectionne }}
            // Le marqueur sélectionné grossit légèrement, ancré par sa pointe.
            style={[styles.zoneAppui, selectionne && styles.selectionne]}>
            <EpingleCoffre taille={TAILLE} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    zoneAppui: {
        // La pointe dépasse du carré après rotation : on lui laisse de la place.
        paddingBottom: TAILLE * 0.25,
        paddingHorizontal: TAILLE * 0.2,
        transformOrigin: 'bottom',
    },
    selectionne: { transform: [{ scale: 1.2 }] },
});
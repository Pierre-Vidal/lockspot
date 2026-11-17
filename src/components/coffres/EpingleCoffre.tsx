import { StyleSheet, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { couleurs } from '@/constants/theme';

type Props = {
    taille?: number;
};

export function EpingleCoffre({ taille = 34 }: Props) {
    const rayon = taille / 2;

    return (
        <View
            style={[
                styles.goutte,
                {
                    width: taille,
                    height: taille,
                    borderTopLeftRadius: rayon,
                    borderTopRightRadius: rayon,
                    borderBottomLeftRadius: rayon,
                },
            ]}>
            <View style={styles.contreRotation}>
                <Icone nom="cadenas" couleur={couleurs.surface} taille={taille * 0.47} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    goutte: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.marqueur,
        transform: [{ rotate: '45deg' }],
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
    },
    contreRotation: { transform: [{ rotate: '-45deg' }] },
});
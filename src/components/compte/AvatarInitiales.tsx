import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { couleurs, polices } from '@/constants/theme';

const TAILLE = 62;

type Props = {
    initiales: string;
};

// Pastille avec les initiales et le petit point vert
export function AvatarInitiales({ initiales }: Props) {
    return (
        <View style={styles.conteneur} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Svg width={TAILLE} height={TAILLE} style={StyleSheet.absoluteFill}>
                <Defs>
                    <LinearGradient id="degrade-avatar" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#C9F2E7" />
                        <Stop offset="1" stopColor="#70D5BA" />
                    </LinearGradient>
                </Defs>
                <Rect width={TAILLE} height={TAILLE} rx={20} fill="url(#degrade-avatar)" />
            </Svg>
            <Text style={styles.initiales}>{initiales}</Text>
            <View style={styles.pastilleEnLigne} />
        </View>
    );
}

const styles = StyleSheet.create({
    conteneur: { width: TAILLE, height: TAILLE, alignItems: 'center', justifyContent: 'center' },
    initiales: { fontFamily: polices.titre, fontSize: 19, color: couleurs.texte },
    pastilleEnLigne: {
        position: 'absolute',
        right: -3,
        bottom: -3,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        borderColor: couleurs.texte,
        backgroundColor: couleurs.principale,
    },
});

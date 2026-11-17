import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import Logo from '@/assets/images/logo.svg';
import { couleurs } from '@/constants/theme';

// Le splash natif affiche l'image splash-icon.png sur 240 px de large, le logo en occupant environ les
// deux tiers. On reprend cette taille pour que le passage du splash à cet écran soit invisible.
const LARGEUR_LOGO = 160;
// Le logo fait 2537 x 564 : on garde ses proportions.
const HAUTEUR_LOGO = (LARGEUR_LOGO * 564) / 2537;

type Props = {
    /** Appelé quand l'écran s'affiche (sert à retirer le splash natif au bon moment). */
    onAffiche?: () => void;
    /** Se pose par-dessus un autre contenu (ex. une carte) et s'efface en fondu quand on le retire. */
    superposition?: boolean;
};

/** Logo Lockspot centré sur le fond de l'appli : à afficher pendant tout chargement plein écran. */
export function EcranChargement({ onAffiche, superposition = false }: Props) {
    return (
        <Animated.View
            onLayout={onAffiche}
            exiting={superposition ? FadeOut.duration(300) : undefined}
            accessibilityRole="progressbar"
            accessibilityLabel="Chargement"
            style={[styles.ecran, superposition && StyleSheet.absoluteFill]}>
            <Logo width={LARGEUR_LOGO} height={HAUTEUR_LOGO} />
            <ActivityIndicator color={couleurs.principale} style={styles.indicateur} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    ecran: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.fond,
    },
    // Posé sous le logo sans le déplacer : le logo reste au centre, comme sur le splash natif.
    indicateur: {
        position: 'absolute',
        top: '50%',
        marginTop: HAUTEUR_LOGO / 2 + 28,
    },
});

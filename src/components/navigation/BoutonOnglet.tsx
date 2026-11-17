import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, typographie } from '@/constants/theme';

type Props = {
    libelle: string;
    icone: ReactNode;
    actif: boolean;
    central?: boolean;
    onPress: () => void;
};

export function BoutonOnglet({ libelle, icone, actif, central = false, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}
            accessibilityLabel={libelle}
            style={styles.bouton}>
            {central ? <View style={styles.rondCentral}>{icone}</View> : icone}
            <Text style={[styles.libelle, actif && styles.libelleActif]}>{libelle}</Text>
        </Pressable>
    );
}

const TAILLE_ROND = 68;

const styles = StyleSheet.create({
    bouton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: espacements.xs,
    },
    rondCentral: {
        width: TAILLE_ROND,
        height: TAILLE_ROND,
        borderRadius: TAILLE_ROND / 2,
        marginTop: -TAILLE_ROND / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principale,
        borderWidth: 5,
        borderColor: couleurs.surface,
        boxShadow: '0 6px 16px rgba(0, 191, 94, 0.35)',
    },
    libelle: { ...typographie.legende, color: couleurs.texteSecondaire },
    libelleActif: { color: couleurs.texte, fontWeight: '700' },
});
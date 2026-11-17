import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone, type NomIcone } from '@/components/Icone';
import { couleurs, polices } from '@/constants/theme';

type Props = {
    icone: NomIcone;
    libelle: string;
    onPress: () => void;
    /** Élément affiché à droite (interrupteur, chevron…). */
    droite?: ReactNode;
    /** Action risquée (déconnexion, suppression) : affichée en rouge. */
    danger?: boolean;
    /** Trait de séparation sous la ligne (toutes sauf la dernière). */
    separateur?: boolean;
};

/** Une ligne de la carte « Réglages ». */
export function LigneReglage({ icone, libelle, onPress, droite, danger = false, separateur = true }: Props) {
    const couleur = danger ? couleurs.erreur : couleurs.texteSecondaire;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={libelle}
            style={({ pressed }) => [styles.ligne, separateur && styles.separateur, pressed && styles.appuyee]}>
            <View style={[styles.carreIcone, danger && styles.carreIconeDanger]}>
                <Icone nom={icone} couleur={couleur} taille={20} />
            </View>
            <Text style={[styles.libelle, danger && styles.libelleDanger]}>{libelle}</Text>
            {droite}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    ligne: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    separateur: { borderBottomWidth: 1, borderBottomColor: couleurs.bordure },
    appuyee: { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
    carreIcone: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.surfaceDouce,
    },
    carreIconeDanger: { backgroundColor: couleurs.erreurLegere },
    libelle: { flex: 1, fontFamily: polices.gras, fontSize: 14, color: couleurs.texte },
    libelleDanger: { color: couleurs.erreur },
});

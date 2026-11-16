import { StyleSheet, Text, View } from 'react-native';

import { arrondis, couleurs, espacements, typographie } from '@/constants/theme';
import type { StatutPosition } from '@/hooks/usePositionUtilisateur';

const AFFICHAGE: Record<StatutPosition, { libelle: string; couleur: string }> = {
    chargement: { libelle: 'Localisation…', couleur: couleurs.texteSecondaire },
    active: { libelle: 'Position sécurisée', couleur: couleurs.principale },
    refusee: { libelle: 'Position refusée', couleur: couleurs.erreur },
    erreur: { libelle: 'Position indisponible', couleur: couleurs.erreur },
};

export function BadgePosition({ statut }: { statut: StatutPosition }) {
    const { libelle, couleur } = AFFICHAGE[statut];

    return (
        <View style={styles.badge} accessibilityRole="text" accessibilityLabel={libelle}>
            <View style={[styles.pastille, { backgroundColor: couleur }]} />
            <Text style={styles.libelle}>{libelle}</Text>
        </View>
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
    pastille: { width: 8, height: 8, borderRadius: 4 },
    libelle: { ...typographie.legende, color: couleurs.texte, fontWeight: '600' },
});
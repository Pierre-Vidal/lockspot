import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, typographie } from '@/constants/theme';
import type { StatutPosition } from '@/hooks/usePositionUtilisateur';

const AFFICHAGE: Record<StatutPosition, { libelle: string; couleur: string }> = {
    chargement: { libelle: 'Localisation…', couleur: couleurs.texteSecondaire },
    active: { libelle: 'Position sécurisée', couleur: couleurs.principale },
    refusee: { libelle: 'Position refusée', couleur: couleurs.erreur },
    erreur: { libelle: 'Position indisponible', couleur: couleurs.erreur },
};

type Props = {
    statut: StatutPosition;
    onRafraichir: () => void;
};

export function BadgePosition({ statut, onRafraichir }: Props) {
    const { libelle, couleur } = AFFICHAGE[statut];
    const enCours = statut === 'chargement';

    return (
        <Pressable
            onPress={onRafraichir}
            disabled={enCours}
            accessibilityRole="button"
            accessibilityLabel={`${libelle}. Actualiser la position`}
            accessibilityState={{ busy: enCours }}
            hitSlop={8}
            style={({ pressed }) => [styles.badge, pressed && styles.appuye]}>
            <View style={[styles.pastille, { backgroundColor: couleur }]} />
            <Text style={styles.libelle}>{libelle}</Text>
            {enCours ? (
                <ActivityIndicator size="small" color={couleurs.texteSecondaire} style={styles.indicateur} />
            ) : (
                <Icone nom="actualiser" couleur={couleurs.texteSecondaire} taille={13} />
            )}
        </Pressable>
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
    appuye: { opacity: 0.7 },
    pastille: { width: 8, height: 8, borderRadius: 4 },
    libelle: { ...typographie.legende, color: couleurs.texte, fontWeight: '600' },
    indicateur: { transform: [{ scale: 0.7 }] },
});

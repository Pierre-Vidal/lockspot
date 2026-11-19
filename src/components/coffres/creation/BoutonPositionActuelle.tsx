import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';
import type { StatutPosition } from '@/hooks/usePositionUtilisateur';

const LIBELLES: Record<StatutPosition, string> = {
    chargement: 'Localisation…',
    active: 'Utiliser ma position actuelle',
    refusee: 'Autoriser la localisation',
    erreur: 'Réessayer la localisation',
};

type Props = {
    statut: StatutPosition;
    onPress: () => void;
    onReessayer: () => void;
};

export function BoutonPositionActuelle({ statut, onPress, onReessayer }: Props) {
    const disponible = statut === 'active';

    return (
        <Pressable
            onPress={disponible ? onPress : onReessayer}
            disabled={statut === 'chargement'}
            accessibilityRole="button"
            accessibilityLabel={LIBELLES[statut]}
            accessibilityState={{ disabled: statut === 'chargement' }}
            style={({ pressed }) => [styles.bouton, pressed && styles.appuye, !disponible && styles.indisponible]}>
            {statut === 'chargement' ? (
                <ActivityIndicator size="small" color={couleurs.texteDiscret} />
            ) : (
                <Icone nom="lieu" couleur={disponible ? couleurs.principaleFoncee : couleurs.texteDiscret} taille={18} />
            )}
            <Text style={styles.libelle}>{LIBELLES[statut]}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    bouton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.sm,
        paddingHorizontal: espacements.md,
        paddingVertical: espacements.sm + 4,
        borderRadius: arrondis.pilule,
        backgroundColor: couleurs.surface,
        boxShadow: '0 4px 14px rgba(28, 41, 38, 0.14)',
    },
    appuye: { transform: [{ scale: 0.96 }] },
    indisponible: { opacity: 0.75 },
    libelle: { fontFamily: polices.semiGras, fontSize: 13, color: couleurs.texte },
});
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, typographie } from '@/constants/theme';
import type { Coffre } from '@/types/coffre';

import { EpingleCoffre } from './EpingleCoffre';

/** `inconnu` : on n'a pas (encore) la position de l'utilisateur. */
export type EtatZone = 'dans-zone' | 'hors-zone' | 'inconnu';

const AFFICHAGE_ZONE: Record<EtatZone, { libelle: string; couleur: string }> = {
    'dans-zone': { libelle: 'Vous êtes dans la zone', couleur: couleurs.principaleFoncee },
    'hors-zone': { libelle: 'Hors zone', couleur: couleurs.attention },
    inconnu: { libelle: 'Position inconnue', couleur: couleurs.texteDiscret },
};

type Props = {
    coffre: Coffre;
    etatZone: EtatZone;
    onPress?: () => void;
};

/** Encadré affiché en bas de la carte quand un coffre est sélectionné. */
export function FicheCoffre({ coffre, etatZone, onPress }: Props) {
    const zone = AFFICHAGE_ZONE[etatZone];

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${coffre.nom}, ${coffre.adresse}, ${zone.libelle}`}
            style={({ pressed }) => [styles.fiche, pressed && styles.appuyee]}>
            <View style={styles.carreIcone}>
                <EpingleCoffre taille={26} />
            </View>

            <View style={styles.textes}>
                <Text style={styles.nom} numberOfLines={1}>
                    {coffre.nom}
                </Text>
                <Text style={styles.adresse} numberOfLines={1}>
                    {coffre.adresse}
                </Text>
                <Text style={[styles.zone, { color: zone.couleur }]}>{zone.libelle}</Text>
            </View>

            <Icone nom="chevronDroite" couleur={couleurs.texte} taille={18} />
        </Pressable>
    );
}

const TAILLE_CARRE = 64;

const styles = StyleSheet.create({
    fiche: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.md,
        padding: espacements.md,
        borderRadius: arrondis.lg,
        backgroundColor: couleurs.surface,
        boxShadow: '0 8px 24px rgba(28, 41, 38, 0.12)',
    },
    appuyee: { opacity: 0.85 },
    carreIcone: {
        width: TAILLE_CARRE,
        height: TAILLE_CARRE,
        borderRadius: arrondis.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principaleLegere,
    },
    textes: { flex: 1, gap: 2 },
    nom: { ...typographie.sousTitre, color: couleurs.texte },
    adresse: { ...typographie.legende, color: couleurs.texteDiscret },
    zone: { ...typographie.legende, fontWeight: '700', marginTop: espacements.xs },
});
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { EpingleCoffre } from '@/components/coffres/EpingleCoffre';
import { arrondis, couleurs, polices } from '@/constants/theme';
import type { Coffre } from '@/types/coffre';

type Props = {
    coffre: Coffre;
    /** `true` si l'utilisateur est dans la zone du coffre : l'épingle est alors en couleur. */
    aProximite: boolean;
    onSupprimer: () => void;
};

/** Une ligne de la liste « Mes coffres », avec son bouton de suppression. */
export function LigneCoffre({ coffre, aProximite, onSupprimer }: Props) {
    return (
        <View style={styles.ligne}>
            <View style={[styles.carreEpingle, !aProximite && styles.carreEpingleEstompe]}>
                <EpingleCoffre taille={22} />
            </View>

            <View style={styles.textes}>
                <Text style={styles.nom} numberOfLines={1}>
                    {coffre.nom}
                </Text>
                <Text style={styles.adresse} numberOfLines={1}>
                    {coffre.adresse}
                </Text>
            </View>

            {aProximite ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeTexte}>À proximité</Text>
                </View>
            ) : null}

            <Pressable
                onPress={onSupprimer}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer le coffre ${coffre.nom}`}
                style={({ pressed }) => [styles.boutonSupprimer, pressed && styles.appuye]}>
                <Icone nom="corbeille" couleur={couleurs.erreur} taille={20} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    ligne: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        paddingLeft: 11,
        paddingRight: 6,
        borderRadius: arrondis.md,
        backgroundColor: 'rgba(255, 253, 249, 0.75)',
    },
    carreEpingle: {
        width: 46,
        height: 46,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principaleLegere,
    },
    carreEpingleEstompe: { opacity: 0.55 },
    textes: { flex: 1, minWidth: 0, gap: 2 },
    nom: { fontFamily: polices.gras, fontSize: 14, color: couleurs.texte },
    adresse: { fontFamily: polices.corps, fontSize: 11, color: couleurs.texteSecondaire },
    badge: {
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: arrondis.pilule,
        backgroundColor: couleurs.principaleLegere,
    },
    badgeTexte: { fontFamily: polices.gras, fontSize: 10, color: couleurs.principaleFoncee },
    boutonSupprimer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appuye: { backgroundColor: couleurs.erreurLegere },
});

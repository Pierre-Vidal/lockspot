import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { EpingleCoffre } from '@/components/coffres/EpingleCoffre';
import { arrondis, couleurs, polices } from '@/constants/theme';
import type { Coffre } from '@/types/coffre';

type Props = {
    coffre: Coffre;
    /** `true` si l'utilisateur est dans la zone du coffre : l'épingle est alors en couleur. */
    aProximite: boolean;
    onModifier: () => void;
    onSupprimer: () => void;
};

/** Une ligne de la liste « Mes coffres », avec ses boutons de modification et de suppression. */
export function LigneCoffre({ coffre, aProximite, onModifier, onSupprimer }: Props) {
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
                {aProximite ? <Text style={styles.proximite}>À proximité</Text> : null}
            </View>

            <Pressable
                onPress={onModifier}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Modifier le coffre ${coffre.nom}`}
                style={({ pressed }) => [styles.bouton, pressed && styles.appuye]}>
                <Icone nom="modifier" couleur={couleurs.texteSecondaire} taille={20} />
            </Pressable>

            <Pressable
                onPress={onSupprimer}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer le coffre ${coffre.nom}`}
                style={({ pressed }) => [styles.bouton, pressed && styles.appuyeDanger]}>
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
        gap: 8,
        paddingVertical: 9,
        paddingLeft: 11,
        paddingRight: 4,
        borderRadius: arrondis.md,
        backgroundColor: 'rgba(255, 253, 249, 0.75)',
    },
    carreEpingle: {
        width: 46,
        height: 46,
        borderRadius: 13,
        marginRight: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principaleLegere,
    },
    carreEpingleEstompe: { opacity: 0.55 },
    textes: { flex: 1, minWidth: 0, gap: 2 },
    nom: { fontFamily: polices.gras, fontSize: 14, color: couleurs.texte },
    adresse: { fontFamily: polices.corps, fontSize: 11, color: couleurs.texteSecondaire },
    proximite: { fontFamily: polices.gras, fontSize: 11, color: couleurs.principaleFoncee },
    bouton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appuye: { backgroundColor: 'rgba(0, 0, 0, 0.06)' },
    appuyeDanger: { backgroundColor: couleurs.erreurLegere },
});

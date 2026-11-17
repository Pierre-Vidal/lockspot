import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FormulaireCoffre } from '@/components/coffres/FormulaireCoffre';
import { couleurs, espacements, polices } from '@/constants/theme';
import { useCoffres } from '@/hooks/useCoffres';

/** Modifie le coffre dont l'identifiant est passé dans l'adresse : /modifier-coffre?id=… */
export default function EcranModifierCoffre() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { coffres, chargement } = useCoffres();
    const coffre = coffres.find((candidat) => candidat.id === id);

    if (chargement) {
        return (
            <View style={styles.centre}>
                <ActivityIndicator size="large" color={couleurs.principale} />
            </View>
        );
    }

    if (!coffre) {
        return (
            <View style={styles.centre}>
                <Text style={styles.titre}>Ce coffre n’existe plus</Text>
                <Text style={styles.texte}>Il a peut-être été supprimé depuis un autre appareil.</Text>
                <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.bouton}>
                    <Text style={styles.libelleBouton}>Retour</Text>
                </Pressable>
            </View>
        );
    }

    // `key` : si on ouvre un autre coffre, le formulaire repart avec ses propres valeurs.
    return <FormulaireCoffre key={coffre.id} coffre={coffre} />;
}

const styles = StyleSheet.create({
    centre: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: espacements.sm,
        padding: espacements.lg,
        backgroundColor: couleurs.fond,
    },
    titre: { fontFamily: polices.titre, fontSize: 20, color: couleurs.texte },
    texte: { fontFamily: polices.corps, fontSize: 14, textAlign: 'center', color: couleurs.texteSecondaire },
    bouton: {
        marginTop: espacements.sm,
        paddingHorizontal: espacements.lg,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: couleurs.principale,
    },
    libelleBouton: { fontFamily: polices.gras, fontSize: 14, color: '#FFFFFF' },
});

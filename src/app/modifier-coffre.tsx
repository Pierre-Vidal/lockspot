import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EcranChargement } from '@/components/EcranChargement';
import { FormulaireCoffre } from '@/components/coffres/FormulaireCoffre';
import { couleurs, espacements, polices } from '@/constants/theme';
import { useCoffres } from '@/hooks/useCoffres';

// Modifie le coffre dont l'id est dans l'adresse (/modifier-coffre?id=…)
export default function EcranModifierCoffre() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { coffres, chargement } = useCoffres();
    const coffre = coffres.find((candidat) => candidat.id === id);

    if (chargement) return <EcranChargement />;

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

    // La key remet le formulaire à zéro si on ouvre un autre coffre
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

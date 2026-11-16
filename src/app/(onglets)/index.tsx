import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { BadgePosition } from '@/components/carte/BadgePosition';
import { CarteCoffres } from '@/components/carte/CarteCoffres';
import { FicheCoffre, type EtatZone } from '@/components/coffres/FicheCoffre';
import { arrondis, couleurs, espacements, typographie } from '@/constants/theme';
import { usePositionUtilisateur } from '@/hooks/usePositionUtilisateur';
import { COFFRES_DE_TEST } from '@/mocks/coffres';
import type { Coffre, Coordonnees } from '@/types/coffre';
import { estDansZone } from '@/utils/geo';

function calculerEtatZone(coffre: Coffre, position: Coordonnees | null): EtatZone {
    if (!position) return 'inconnu';
    return estDansZone(position, coffre.coordonnees, RAYON_ZONE_METRES) ? 'dans-zone' : 'hors-zone';
}

export default function EcranCarte() {
    const { statut, position } = usePositionUtilisateur();
    const [idCoffreSelectionne, setIdCoffreSelectionne] = useState<string | null>(null);

    const coffres = COFFRES_DE_TEST;
    const coffreSelectionne = coffres.find((coffre) => coffre.id === idCoffreSelectionne) ?? null;

    return (
        <SafeAreaView edges={['top']} style={styles.ecran}>
            <View style={styles.entete}>
                <View>
                    <Text style={styles.surtitre}>BONJOUR</Text>
                    <Text style={styles.titre}>Vos coffres</Text>
                </View>
                <BadgePosition statut={statut} />
            </View>

            <View style={styles.cadreCarte}>
                <CarteCoffres
                    coffres={coffres}
                    positionUtilisateur={position}
                    idCoffreSelectionne={idCoffreSelectionne}
                    onSelectionCoffre={setIdCoffreSelectionne}
                />

                {coffreSelectionne && (
                    <Animated.View
                        key={coffreSelectionne.id}
                        entering={FadeInDown.springify().damping(18)}
                        exiting={FadeOutDown.duration(150)}
                        style={styles.emplacementFiche}>
                        <FicheCoffre coffre={coffreSelectionne} etatZone={calculerEtatZone(coffreSelectionne, position)} />
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    ecran: { flex: 1, backgroundColor: couleurs.fond },
    entete: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: espacements.lg,
        paddingTop: espacements.md,
        paddingBottom: espacements.md,
    },
    surtitre: { ...typographie.surtitre, color: couleurs.principaleFoncee },
    titre: { ...typographie.titre, color: couleurs.texte },
    cadreCarte: {
        flex: 1,
        marginHorizontal: espacements.md,
        marginBottom: espacements.md,
        borderRadius: arrondis.lg,
        overflow: 'hidden', // arrondit les coins de la carte
    },
    emplacementFiche: {
        position: 'absolute',
        left: espacements.sm,
        right: espacements.sm,
        bottom: espacements.sm,
    },
});
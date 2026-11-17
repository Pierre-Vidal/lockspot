import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import type { BottomTabNavigationProp } from 'expo-router/tabs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { OUVRIR_COFFRE_DANS_LA_ZONE } from '@/constants/notifications';
import { ErrorBanner } from '@/components/auth/error-banner';
import { BadgePosition } from '@/components/carte/BadgePosition';
import { CarteCoffres } from '@/components/carte/CarteCoffres';
import { FicheCoffre, type EtatZone } from '@/components/coffres/FicheCoffre';
import { arrondis, couleurs, espacements, polices, typographie } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useCoffres } from '@/hooks/useCoffres';
import { usePositionUtilisateur } from '@/hooks/usePositionUtilisateur';
import type { Coffre, Coordonnees } from '@/types/coffre';
import { estDansZone } from '@/utils/geo';
import { MessageDeverrouillage } from '@/components/carte/MessageDeverrouillage';
import { useDeverrouillage } from '@/hooks/useDeverrouillage';

function calculerEtatZone(coffre: Coffre, position: Coordonnees | null): EtatZone {
    if (!position) return 'inconnu';
    return estDansZone(position, coffre.coordonnees, RAYON_ZONE_METRES) ? 'dans-zone' : 'hors-zone';
}

export default function EcranCarte() {
    const { user } = useAuth();
    const { statut, position } = usePositionUtilisateur();
    // On prend l'id et pas l'objet pour afficher la version à jour venant de Firestore
    const [idCoffreSelectionne, setIdCoffreSelectionne] = useState<string | null>(null);

    const salutation = user?.displayName ? `Bonjour ${user.displayName}` : 'Bonjour';
    const { coffres, chargement, erreur } = useCoffres();
    const coffreSelectionne = coffres.find((coffre) => coffre.id === idCoffreSelectionne) ?? null;
    const { deverrouiller, deverrouillerCoffre, message, effacerMessage } = useDeverrouillage({
        coffres,
        position,
        idCoffreSelectionne,
    });

    // Le bouton central « Déverrouiller » est l'onglet de cet écran : BarreOnglets émet « tabPress »
    // à chaque appui, y compris quand on est déjà sur la carte.
    const navigation = useNavigation<BottomTabNavigationProp<Record<string, object | undefined>>>();
    useEffect(() => navigation.addListener('tabPress', deverrouiller), [navigation, deverrouiller]);

    // Ouverture demandée depuis une notification (voir useOuvertureDepuisNotification) :
    // on attend la liste des coffres et la position, puis on tente d'ouvrir comme avec le bouton central.
    const { ouvrir } = useLocalSearchParams<{ ouvrir?: string }>();
    const ouvertureLancee = useRef(false);

    const ouvrirDepuisNotification = useCallback(
        (idCoffre: string | null) => {
            // On montre le coffre visé sur la carte, même si l'ouverture est refusée (hors zone, etc.).
            if (idCoffre) setIdCoffreSelectionne(idCoffre);
            deverrouillerCoffre(idCoffre);
        },
        [deverrouillerCoffre],
    );

    useEffect(() => {
        if (!ouvrir) {
            ouvertureLancee.current = false;
            return;
        }
        if (ouvertureLancee.current || chargement || statut === 'chargement') return;

        ouvertureLancee.current = true;
        router.setParams({ ouvrir: undefined });
        ouvrirDepuisNotification(ouvrir === OUVRIR_COFFRE_DANS_LA_ZONE ? null : ouvrir);
    }, [ouvrir, chargement, statut, ouvrirDepuisNotification]);

    return (
        <SafeAreaView edges={['top']} style={styles.ecran}>
            <View style={styles.entete}>
                <View>
                    <Text style={styles.surtitre}>{salutation.toUpperCase()}</Text>
                    <Text style={styles.titre}>Vos coffres</Text>
                </View>
                <BadgePosition statut={statut} />
            </View>

            <View style={styles.cadreCarte}>
                {chargement ? (
                    <View style={styles.centre}>
                        <ActivityIndicator size="large" color={couleurs.principale} />
                    </View>
                ) : (
                    <CarteCoffres
                        coffres={coffres}
                        positionUtilisateur={position}
                        idCoffreSelectionne={idCoffreSelectionne}
                        onSelectionCoffre={setIdCoffreSelectionne}
                    />
                )}

                {(erreur || message) && (
                    <View style={styles.emplacementErreur}>
                        {erreur && <ErrorBanner message={erreur} />}
                        {message && <MessageDeverrouillage message={message} onFermer={effacerMessage} />}
                    </View>
                )}

                {!chargement && coffres.length === 0 && (
                    <View style={[styles.emplacementFiche, styles.vide]}>
                        <Text style={styles.titreVide}>Aucun coffre pour l’instant</Text>
                        <Text style={styles.texteVide}>Touchez « Nouveau coffre » pour créer le premier.</Text>
                    </View>
                )}

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
        overflow: 'hidden',
    },
    centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emplacementErreur: { position: 'absolute', top: espacements.sm, left: espacements.sm, right: 64 },
    vide: {
        gap: espacements.xs,
        padding: espacements.md,
        borderRadius: arrondis.lg,
        backgroundColor: couleurs.surface,
        boxShadow: '0 8px 24px rgba(28, 41, 38, 0.12)',
    },
    titreVide: { fontFamily: polices.gras, fontSize: 15, color: couleurs.texte },
    texteVide: { fontFamily: polices.corps, fontSize: 13, color: couleurs.texteSecondaire },
    emplacementFiche: {
        position: 'absolute',
        left: espacements.sm,
        right: espacements.sm,
        bottom: espacements.sm,
    },
});
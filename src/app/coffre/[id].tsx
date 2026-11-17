import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/primary-button';
import { EcranChargement } from '@/components/EcranChargement';
import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';
import { useCoffres } from '@/hooks/useCoffres';
import { estOuvert, refermer, tempsRestant } from '@/services/sessionsCoffres';

export default function EcranCoffreOuvert() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { coffres, chargement } = useCoffres();
    const coffre = coffres.find((candidat) => candidat.id === id);
    const [autorise] = useState(() => estOuvert(id));

    const verrouiller = useCallback(() => {
        refermer(id);
        if (router.canGoBack()) router.back();
        else router.replace('/');
    }, [id]);

    useEffect(() => {
        if (!autorise) return;

        const minuteur = setTimeout(verrouiller, tempsRestant(id));
        const abonnement = AppState.addEventListener('change', (etat) => {
            if (etat === 'background') verrouiller();
        });

        return () => {
            clearTimeout(minuteur);
            abonnement.remove();
        };
    }, [autorise, id, verrouiller]);

    if (!autorise) return <Redirect href="/" />;

    if (chargement || !coffre) return <EcranChargement />;

    return (
        <SafeAreaView style={styles.ecran}>
            <Pressable
                onPress={verrouiller}
                accessibilityRole="button"
                accessibilityLabel="Fermer et verrouiller le coffre"
                hitSlop={8}
                style={styles.boutonRetour}>
                <Icone nom="retour" couleur={couleurs.texte} taille={18} />
            </Pressable>

            <View style={styles.entete}>
                <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.carreIcone}>
                    <Icone nom="cadenasOuvert" couleur={couleurs.principaleFoncee} taille={34} />
                </Animated.View>
                <Text style={styles.surtitre}>COFFRE OUVERT</Text>
                <Text style={styles.nom}>{coffre.nom}</Text>
                <Text style={styles.adresse}>{coffre.adresse}</Text>
            </View>

            <Animated.View entering={FadeIn.delay(200)} style={styles.contenu}>
                <Text style={styles.titreContenu}>Contenu</Text>
                <Text style={styles.texteContenu}>Ce coffre est vide pour l’instant.</Text>
            </Animated.View>

            <View style={styles.bas}>
                <Text style={styles.avertissement}>Il se verrouille automatiquement si vous quittez l’application.</Text>
                <PrimaryButton label="Verrouiller" onPress={verrouiller} />
            </View>
        </SafeAreaView>
    );
}

const TAILLE_CARRE = 88;

const styles = StyleSheet.create({
    ecran: { flex: 1, paddingHorizontal: espacements.lg, backgroundColor: couleurs.fond },
    boutonRetour: {
        width: 44,
        height: 44,
        marginTop: espacements.sm,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.surface,
        boxShadow: '0 4px 14px rgba(28, 41, 38, 0.12)',
    },
    entete: { alignItems: 'center', gap: espacements.xs, marginTop: espacements.lg },
    carreIcone: {
        width: TAILLE_CARRE,
        height: TAILLE_CARRE,
        marginBottom: espacements.md,
        borderRadius: arrondis.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principaleLegere,
    },
    surtitre: { fontFamily: polices.gras, fontSize: 11, letterSpacing: 1.5, color: couleurs.principaleFoncee },
    nom: { fontFamily: polices.titre, fontSize: 28, color: couleurs.texte, textAlign: 'center' },
    adresse: { fontFamily: polices.corps, fontSize: 13, color: couleurs.texteDiscret, textAlign: 'center' },
    contenu: {
        flex: 1,
        gap: espacements.sm,
        marginTop: espacements.xl,
        padding: espacements.lg,
        borderRadius: arrondis.lg,
        backgroundColor: couleurs.surface,
    },
    titreContenu: { fontFamily: polices.gras, fontSize: 15, color: couleurs.texte },
    texteContenu: { fontFamily: polices.corps, fontSize: 14, color: couleurs.texteSecondaire },
    bas: { gap: espacements.md, paddingVertical: espacements.lg },
    avertissement: { fontFamily: polices.corps, fontSize: 12, color: couleurs.texteDiscret, textAlign: 'center' },
});
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoutonPositionActuelle } from '@/components/coffres/creation/BoutonPositionActuelle';
import { CarteChoixLieu } from '@/components/coffres/creation/CarteChoixLieu';
import { PanneauNouveauCoffre } from '@/components/coffres/creation/PanneauNouveauCoffre';
import { RechercheAdresse } from '@/components/coffres/creation/RechercheAdresse';
import { arrondis, couleurs, espacements } from '@/constants/theme';
import { useCreationCoffre } from '@/hooks/useCreationCoffre';
import { usePositionUtilisateur } from '@/hooks/usePositionUtilisateur';
import { useRechercheAdresse } from '@/hooks/useRechercheAdresse';
import type { SuggestionAdresse } from '@/services/geocodage';
import type { Coordonnees } from '@/types/coffre';

export default function EcranNouveauCoffre() {
    const marges = useSafeAreaInsets();
    const { statut, position, rafraichir } = usePositionUtilisateur();
    const creation = useCreationCoffre();
    const [texteRecherche, setTexteRecherche] = useState('');
    const recherche = useRechercheAdresse(texteRecherche, position);

    function choisirSuggestion(suggestion: SuggestionAdresse) {
        setTexteRecherche(suggestion.nom);
        creation.choisirSuggestion(suggestion);
    }

    function choisirCoordonnees(coordonnees: Coordonnees) {
        Keyboard.dismiss();
        setTexteRecherche('');
        creation.choisirCoordonnees(coordonnees);
    }

    async function creer() {
        Keyboard.dismiss();
        if (await creation.creer()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        }
    }

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.ecran}>
            <View style={styles.zoneCarte}>
                <CarteChoixLieu lieu={creation.lieu?.coordonnees ?? null} onChoisirCoordonnees={choisirCoordonnees} />

                <View style={[styles.haut, { top: marges.top + espacements.sm }]}>
                    <RechercheAdresse
                        valeur={texteRecherche}
                        onChangeValeur={setTexteRecherche}
                        suggestions={recherche.suggestions}
                        chargement={recherche.chargement}
                        erreur={recherche.erreur}
                        onChoisir={choisirSuggestion}
                        onRetour={() => router.back()}
                    />
                </View>

                <View style={styles.bas}>
                    <BoutonPositionActuelle
                        statut={statut}
                        onPress={() => position && choisirCoordonnees(position)}
                        onReessayer={rafraichir}
                    />
                </View>
            </View>

            <PanneauNouveauCoffre
                etape={creation.lieu ? 2 : 1}
                nom={creation.nom}
                onChangeNom={creation.modifierNom}
                erreurNom={creation.erreurNom}
                adresse={creation.lieu?.adresse ?? null}
                chargementAdresse={creation.chargementAdresse}
                erreurEnvoi={creation.erreurEnvoi}
                envoiEnCours={creation.envoiEnCours}
                onCreer={creer}
                margeBas={marges.bottom + espacements.md}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    ecran: { flex: 1, backgroundColor: couleurs.fond },
    zoneCarte: { flex: 1 },
    haut: { position: 'absolute', left: espacements.md, right: espacements.md },
    bas: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: arrondis.lg + espacements.md,
        alignItems: 'center',
    },
});
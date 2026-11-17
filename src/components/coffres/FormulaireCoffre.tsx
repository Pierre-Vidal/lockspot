import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoutonPositionActuelle } from '@/components/coffres/creation/BoutonPositionActuelle';
import { CarteChoixLieu } from '@/components/coffres/creation/CarteChoixLieu';
import { PanneauCoffre } from '@/components/coffres/creation/PanneauCoffre';
import { RechercheAdresse } from '@/components/coffres/creation/RechercheAdresse';
import { arrondis, couleurs, espacements } from '@/constants/theme';
import { useFormulaireCoffre } from '@/hooks/useFormulaireCoffre';
import { useNotifications } from '@/hooks/useNotifications';
import { usePositionUtilisateur } from '@/hooks/usePositionUtilisateur';
import { useRechercheAdresse } from '@/hooks/useRechercheAdresse';
import type { SuggestionAdresse } from '@/services/geocodage';
import type { Coffre, Coordonnees } from '@/types/coffre';

type Props = {
    /** Coffre à modifier. Absent : on crée un nouveau coffre. */
    coffre?: Coffre;
};

/** Écran plein format (carte + recherche + panneau) partagé par la création et la modification. */
export function FormulaireCoffre({ coffre }: Props) {
    const marges = useSafeAreaInsets();
    const { statut, position } = usePositionUtilisateur();
    const formulaire = useFormulaireCoffre(coffre);
    const { notifierSiDansLaZone } = useNotifications();
    const [texteRecherche, setTexteRecherche] = useState('');
    const recherche = useRechercheAdresse(texteRecherche, position);

    function choisirSuggestion(suggestion: SuggestionAdresse) {
        setTexteRecherche(suggestion.nom);
        formulaire.choisirSuggestion(suggestion);
    }

    function choisirCoordonnees(coordonnees: Coordonnees) {
        Keyboard.dismiss();
        setTexteRecherche('');
        formulaire.choisirCoordonnees(coordonnees);
    }

    async function valider() {
        Keyboard.dismiss();
        const { lieu, nom } = formulaire;
        if (await formulaire.enregistrer()) {
            // Coffre créé, ou déplacé, là où l'on se trouve : on prévient tout de suite qu'on peut l'ouvrir.
            // Un simple changement de nom ne déclenche rien.
            const aBouge =
                !coffre ||
                lieu?.coordonnees.latitude !== coffre.coordonnees.latitude ||
                lieu?.coordonnees.longitude !== coffre.coordonnees.longitude;
            if (lieu && aBouge) notifierSiDansLaZone(nom.trim(), lieu.coordonnees, position, coffre?.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        }
    }

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.ecran}>
            <View style={styles.zoneCarte}>
                <CarteChoixLieu lieu={formulaire.lieu?.coordonnees ?? null} onChoisirCoordonnees={choisirCoordonnees} />

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
                    <BoutonPositionActuelle statut={statut} onPress={() => position && choisirCoordonnees(position)} />
                </View>
            </View>

            <PanneauCoffre
                mode={coffre ? 'modification' : 'creation'}
                etape={formulaire.lieu ? 2 : 1}
                nom={formulaire.nom}
                onChangeNom={formulaire.modifierNom}
                erreurNom={formulaire.erreurNom}
                adresse={formulaire.lieu?.adresse ?? null}
                chargementAdresse={formulaire.chargementAdresse}
                erreurEnvoi={formulaire.erreurEnvoi}
                envoiEnCours={formulaire.envoiEnCours}
                onValider={valider}
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

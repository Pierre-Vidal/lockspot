import { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';
import type { SuggestionAdresse } from '@/services/geocodage';

type Props = {
    valeur: string;
    onChangeValeur: (valeur: string) => void;
    suggestions: SuggestionAdresse[];
    chargement: boolean;
    erreur: string | null;
    onChoisir: (suggestion: SuggestionAdresse) => void;
    onRetour: () => void;
};

export function RechercheAdresse({ valeur, onChangeValeur, suggestions, chargement, erreur, onChoisir, onRetour }: Props) {
    const [actif, setActif] = useState(false);
    const listeVisible = actif && (suggestions.length > 0 || erreur !== null);

    function choisir(suggestion: SuggestionAdresse) {
        Keyboard.dismiss();
        setActif(false);
        onChoisir(suggestion);
    }

    return (
        <View style={styles.conteneur}>
            <View style={styles.ligne}>
                <Pressable
                    onPress={onRetour}
                    accessibilityRole="button"
                    accessibilityLabel="Retour"
                    hitSlop={8}
                    style={({ pressed }) => [styles.boutonRetour, pressed && styles.appuye]}>
                    <Icone nom="retour" couleur={couleurs.texte} taille={18} />
                </Pressable>

                <View style={[styles.champ, actif && styles.champActif]}>
                    <Icone nom="recherche" couleur={couleurs.texteSecondaire} taille={18} />
                    <TextInput
                        value={valeur}
                        onChangeText={(texte) => {
                            setActif(true);
                            onChangeValeur(texte);
                        }}
                        onFocus={() => setActif(true)}
                        onBlur={() => setActif(false)}
                        placeholder="Rechercher une adresse"
                        placeholderTextColor={couleurs.texteDiscret}
                        selectionColor={couleurs.principale}
                        accessibilityLabel="Rechercher une adresse"
                        returnKeyType="search"
                        autoCorrect={false}
                        style={styles.saisie}
                    />
                    {chargement && <ActivityIndicator size="small" color={couleurs.principale} />}
                    {!chargement && valeur.length > 0 && (
                        <Pressable onPress={() => onChangeValeur('')} accessibilityRole="button" accessibilityLabel="Effacer la recherche" hitSlop={8}>
                            <Icone nom="effacer" couleur={couleurs.texteDiscret} taille={16} />
                        </Pressable>
                    )}
                </View>
            </View>

            {listeVisible && (
                <View style={styles.liste}>
                    {erreur ? (
                        <Text style={styles.erreur}>{erreur}</Text>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <Pressable
                                key={suggestion.id}
                                onPress={() => choisir(suggestion)}
                                accessibilityRole="button"
                                accessibilityLabel={suggestion.adresse}
                                style={({ pressed }) => [
                                    styles.suggestion,
                                    index > 0 && styles.separateur,
                                    pressed && styles.suggestionAppuyee,
                                ]}>
                                <Icone nom="lieu" couleur={couleurs.principaleFoncee} taille={18} />
                                <View style={styles.textesSuggestion}>
                                    <Text style={styles.nomSuggestion} numberOfLines={1}>
                                        {suggestion.nom}
                                    </Text>
                                    {suggestion.contexte ? (
                                        <Text style={styles.contexteSuggestion} numberOfLines={1}>
                                            {suggestion.contexte}
                                        </Text>
                                    ) : null}
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}

const HAUTEUR = 48;
const OMBRE = '0 4px 14px rgba(28, 41, 38, 0.12)';

const styles = StyleSheet.create({
    conteneur: { gap: espacements.sm },
    ligne: { flexDirection: 'row', alignItems: 'center', gap: espacements.sm + 4 },
    boutonRetour: {
        width: HAUTEUR,
        height: HAUTEUR,
        borderRadius: HAUTEUR / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.surface,
        boxShadow: OMBRE,
    },
    appuye: { transform: [{ scale: 0.94 }] },
    champ: {
        flex: 1,
        height: HAUTEUR,
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.sm + 2,
        paddingHorizontal: espacements.md,
        borderRadius: arrondis.md,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: couleurs.surface,
        boxShadow: OMBRE,
    },
    champActif: { borderColor: couleurs.principale },
    saisie: { flex: 1, minWidth: 0, height: '100%', fontFamily: polices.corps, fontSize: 14, color: couleurs.texte },
    liste: {
        marginLeft: HAUTEUR + espacements.sm + 4,
        borderRadius: arrondis.md,
        backgroundColor: couleurs.surface,
        boxShadow: OMBRE,
        overflow: 'hidden',
    },
    suggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.sm + 2,
        paddingHorizontal: espacements.md,
        paddingVertical: espacements.sm + 4,
    },
    separateur: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: couleurs.bordure },
    suggestionAppuyee: { backgroundColor: couleurs.principaleLegere },
    textesSuggestion: { flex: 1, gap: 1 },
    nomSuggestion: { fontFamily: polices.semiGras, fontSize: 14, color: couleurs.texte },
    contexteSuggestion: { fontFamily: polices.corps, fontSize: 12, color: couleurs.texteDiscret },
    erreur: { padding: espacements.md, fontFamily: polices.semiGras, fontSize: 12, color: couleurs.erreur },
});